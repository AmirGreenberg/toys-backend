
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy, sort) {
    if (!filterBy) return Promise.resolve(toys)

    let toysToReturn = toys

    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.labels && filterBy.labels[0]) {
        toysToReturn = toysToReturn.filter(toy => toy.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.inStock) {
        const regExp = new RegExp(filterBy.inStock, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.inStock))
    }
    if (filterBy.price) {
        toysToReturn = toysToReturn.filter(toy => toy.price <= filterBy.price)
    }

    toysToReturn.sort((toy1, toy2) => {
        const dir = JSON.parse(sort.asc) ? 1 : -1
        if (sort.by === 'price') return (toy1.price - toy2.price) * dir
        if (sort.by === 'name') return toy1.name.localeCompare(toy2.name) * dir
    })


    // if (filterBy.sortBy === 'createdAt') {
    //     toysToReturn.sort((b1, b2) => (b1.createdAt - b2.createdAt) * filterBy.sortDir)
    // } else if (filterBy.sortBy === 'name') {
    //     toysToReturn.sort(
    //         (b1, b2) => b1.name.localeCompare(b2.name) * filterBy.sortDir
    //     )
    // } else {
    //     toysToReturn.sort((b1, b2) => (b1.price - b2.price) * filterBy.sortDir)
    // }
    return Promise.resolve(toysToReturn)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    if (!loggedinUser.isAdmin &&
        toy.owner._id !== loggedinUser._id) {
        return Promise.reject('Not your toy')
    }
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        if (!loggedinUser.isAdmin &&
            toyToUpdate.owner._id !== loggedinUser._id) {
            return Promise.reject('Not your toy')
        }
        toyToUpdate.price = toy.price
        toy = toyToUpdate

    } else {
        toy._id = utilService.makeId()
        toy.owner = {
            fullname: loggedinUser.fullname,
            score: loggedinUser.score,
            _id: loggedinUser._id,
            isAdmin: loggedinUser.isAdmin
        }
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
