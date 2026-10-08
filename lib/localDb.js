import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DB_DIR = path.join(process.cwd(), '.local_db')

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }
}

function loadCollection(name) {
  ensureDir()
  const filePath = path.join(DB_DIR, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    return []
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.error(`Error reading ${name}.json:`, e.message)
    return []
  }
}

function saveCollection(name, data) {
  ensureDir()
  const filePath = path.join(DB_DIR, `${name}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

function matchCondition(val, condition) {
  if (condition === undefined) return true
  if (condition === null) return val === null
  if (typeof condition === 'object' && condition !== null) {
    if (condition.$regex) {
      const flags = condition.$options || ''
      const re = new RegExp(condition.$regex, flags)
      return re.test(String(val || ''))
    }
    if (condition.$in && Array.isArray(condition.$in)) {
      if (Array.isArray(val)) {
        return val.some(v => condition.$in.includes(v))
      }
      return condition.$in.includes(val)
    }
    if (condition.$nin && Array.isArray(condition.$nin)) {
      return !condition.$nin.includes(val)
    }
    if (condition.$gte !== undefined && Number(val) < Number(condition.$gte)) return false
    if (condition.$lte !== undefined && Number(val) > Number(condition.$lte)) return false
    if (condition.$gt !== undefined && Number(val) <= Number(condition.$gt)) return false
    if (condition.$lt !== undefined && Number(val) >= Number(condition.$lt)) return false
    return true
  }
  return val === condition
}

function matchesFilter(item, query = {}) {
  if (!query || Object.keys(query).length === 0) return true
  for (const [key, cond] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(cond)) {
      const matched = cond.some(subQ => matchesFilter(item, subQ))
      if (!matched) return false
      continue
    }
    if (key === '$and' && Array.isArray(cond)) {
      const matched = cond.every(subQ => matchesFilter(item, subQ))
      if (!matched) return false
      continue
    }
    const val = key.includes('.') ? key.split('.').reduce((obj, k) => obj?.[k], item) : item[key]
    if (!matchCondition(val, cond)) {
      return false
    }
  }
  return true
}

class LocalCursor {
  constructor(items) {
    this.items = [...items]
  }

  sort(sortObj) {
    if (!sortObj || Object.keys(sortObj).length === 0) return this
    const [key, dir] = Object.entries(sortObj)[0]
    const direction = dir === -1 || dir === 'desc' ? -1 : 1
    this.items.sort((a, b) => {
      const valA = a[key]
      const valB = b[key]
      if (valA === valB) return 0
      if (valA === undefined || valA === null) return 1
      if (valB === undefined || valB === null) return -1
      return valA > valB ? direction : -direction
    })
    return this
  }

  skip(n) {
    this.items = this.items.slice(n)
    return this
  }

  limit(n) {
    this.items = this.items.slice(0, n)
    return this
  }

  async toArray() {
    return this.items.map(i => ({ ...i }))
  }
}

class LocalCollection {
  constructor(name) {
    this.name = name
  }

  find(query = {}) {
    const list = loadCollection(this.name)
    const filtered = list.filter(item => matchesFilter(item, query))
    return new LocalCursor(filtered)
  }

  async findOne(query = {}) {
    const list = loadCollection(this.name)
    const item = list.find(item => matchesFilter(item, query))
    return item ? { ...item } : null
  }

  async insertOne(doc) {
    const list = loadCollection(this.name)
    const newDoc = {
      _id: doc._id || uuidv4(),
      id: doc.id || `id_${uuidv4().slice(0, 8)}`,
      ...doc
    }
    list.push(newDoc)
    saveCollection(this.name, list)
    return { insertedId: newDoc._id }
  }

  async insertMany(docs) {
    const list = loadCollection(this.name)
    const insertedIds = []
    for (const d of docs) {
      const newDoc = {
        _id: d._id || uuidv4(),
        id: d.id || `id_${uuidv4().slice(0, 8)}`,
        ...d
      }
      list.push(newDoc)
      insertedIds.push(newDoc._id)
    }
    saveCollection(this.name, list)
    return { insertedCount: docs.length, insertedIds }
  }

  async updateOne(query, update = {}) {
    const list = loadCollection(this.name)
    const index = list.findIndex(item => matchesFilter(item, query))
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 }
    const item = { ...list[index] }

    if (update.$set) {
      for (const [k, v] of Object.entries(update.$set)) {
        if (k.includes('.')) {
          const parts = k.split('.')
          let target = item
          for (let i = 0; i < parts.length - 1; i++) {
            target[parts[i]] = target[parts[i]] || {}
            target = target[parts[i]]
          }
          target[parts[parts.length - 1]] = v
        } else {
          item[k] = v
        }
      }
    }

    if (update.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        item[k] = Array.isArray(item[k]) ? [...item[k], v] : [v]
      }
    }

    if (update.$pull) {
      for (const [k, v] of Object.entries(update.$pull)) {
        if (Array.isArray(item[k])) {
          item[k] = item[k].filter(el => !matchesFilter(el, v))
        }
      }
    }

    list[index] = item
    saveCollection(this.name, list)
    return { matchedCount: 1, modifiedCount: 1 }
  }

  async findOneAndUpdate(query, update = {}, options = {}) {
    const list = loadCollection(this.name)
    const index = list.findIndex(item => matchesFilter(item, query))
    if (index === -1) return null
    const before = { ...list[index] }
    await this.updateOne(query, update)
    const updatedList = loadCollection(this.name)
    const after = updatedList[index] ? { ...updatedList[index] } : null
    return (options.returnDocument === 'after' || options.returnOriginal === false) ? after : before
  }

  async findOneAndDelete(query) {
    const list = loadCollection(this.name)
    const index = list.findIndex(item => matchesFilter(item, query))
    if (index === -1) return null
    const item = { ...list[index] }
    list.splice(index, 1)
    saveCollection(this.name, list)
    return item
  }

  async updateMany(query, update = {}) {
    const list = loadCollection(this.name)
    let count = 0
    for (let i = 0; i < list.length; i++) {
      if (matchesFilter(list[i], query)) {
        const item = { ...list[i] }
        if (update.$set) Object.assign(item, update.$set)
        list[i] = item
        count++
      }
    }
    saveCollection(this.name, list)
    return { matchedCount: count, modifiedCount: count }
  }

  async deleteOne(query) {
    const list = loadCollection(this.name)
    const idx = list.findIndex(item => matchesFilter(item, query))
    if (idx !== -1) {
      list.splice(idx, 1)
      saveCollection(this.name, list)
      return { deletedCount: 1 }
    }
    return { deletedCount: 0 }
  }

  async deleteMany(query = {}) {
    const list = loadCollection(this.name)
    const remaining = list.filter(item => !matchesFilter(item, query))
    const deletedCount = list.length - remaining.length
    saveCollection(this.name, remaining)
    return { deletedCount }
  }

  async countDocuments(query = {}) {
    const list = loadCollection(this.name)
    return list.filter(item => matchesFilter(item, query)).length
  }

  aggregate(pipeline = []) {
    const list = loadCollection(this.name)
    let results = [...list]
    for (const stage of pipeline) {
      if (stage.$group) {
        const groupField = stage.$group._id
        const groups = {}
        const fieldName = typeof groupField === 'string' && groupField.startsWith('$') ? groupField.slice(1) : '_id'
        for (const item of results) {
          const key = item[fieldName] || 'Other'
          groups[key] = (groups[key] || 0) + 1
        }
        results = Object.entries(groups).map(([k, count]) => ({ _id: k, count }))
      }
    }
    return {
      async toArray() {
        return results
      }
    }
  }
}

class LocalDatabase {
  constructor() {
    this.collections = new Map()
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new LocalCollection(name))
    }
    return this.collections.get(name)
  }
}

export const localDb = new LocalDatabase()
