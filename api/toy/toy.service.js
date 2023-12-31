import { ObjectId } from 'mongodb'

import { utilService } from '../../services/util.service.js'
import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}

// async function query(filterBy = {}, sort = {}) {
//     try {
//         const criteria = {};
//         if (filterBy.name) {
//             criteria.name = { $regex: filterBy.name, $options: 'i' };
//         }
//         if (filterBy.inStock !== undefined) {
//             criteria.inStock = filterBy.inStock;
//         }
//         if (filterBy.labels && filterBy.labels.length > 0) {
//             criteria.labels = { $elemMatch: { $in: filterBy.labels } };
//         }
//         if (filterBy.price) {
//             criteria.price = { $lte: filterBy.price };
//         }

//         const sortCriteria = {};
//         if (sort.by) {
//             sortCriteria[sort.by] = sort.asc ? 1 : -1;
//         }

//         const collection = await dbService.getCollection('toy');
//         var toys = await collection.find(criteria).sort(sortCriteria).toArray();
//         return toys;
//     } catch (err) {
//         logger.error('cannot find toys', err);
//         throw err;
//     }
// }

async function query(filterBy = {}, sort = {}) {
    console.log("🚀  filterBy:", filterBy)

    try {
        const criteria = {};
        if (filterBy.name) {
            criteria.name = { $regex: filterBy.name, $options: 'i' };
        }
        if (filterBy.inStock) {
            if (filterBy.inStock === 'true') criteria.inStock = true
            else if (filterBy.inStock === 'false') criteria.inStock = false
            else criteria.inStock = ''
        }
        if (filterBy.labels && filterBy.labels.length > 0) {
            criteria.labels = { $elemMatch: { $in: filterBy.labels } };
        }
        if (filterBy.price) {
            criteria.price = { $lte: +filterBy.price };
        }

        const sortCriteria = {};
        const dir = sort.asc
        if (sort.by === 'price') {
            sortCriteria.price = dir;
        } else if (sort.by === 'name') {
            sortCriteria.name = dir;
        }

        console.log("🚀  criteria:", criteria)
        const collection = await dbService.getCollection('toy');
        var toys = await collection.find(criteria).sort(sortCriteria).toArray();
        // var toys = await collection.find(criteria).toArray();
        return toys;
    } catch (err) {
        logger.error('cannot find toys', err);
        throw err;
    }
}


async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: new ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: +toy.price,
            labels: toy.labels,
            inStock: !!toy.inStock,

        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}