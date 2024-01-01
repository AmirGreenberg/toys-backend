import { logger } from '../../services/logger.service.js'
import { toyService } from './toy.service.js'

export async function getToys(req, res) {
    try {
        const { filterBy = {}, sort = {} } = req.query.params

        // const filterBy = {
        //     name: req.query.name || '',
        //     price: req.query.price || '',
        //     labels: req.query.labels || '',
        //     createdAt: req.query.createdAt || '',
        //     inStock: req.query.inStock || '',
        // }

        // const sort = {
        //     by: req.query.by || '',
        //     asc: req.query.asc || true,

        // }

        logger.debug('Getting Toys', filterBy, sort)
        const toys = await toyService.query(filterBy, sort)
        res.json(toys)
    } catch (err) {
        logger.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = req

    try {
        const toy = {
            name: req.body.name,
            price: +req.body.price,
            labels: req.body.labels,
            createdAt: +req.body.createdAt,
            inStock: !!req.body.inStock,
        }
        toy.owner = loggedinUser
        const addedToy = await toyService.add(toy)
        res.json(addedToy)
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        const toy = {
            name: req.body.name,
            price: +req.body.price,
            labels: req.body.labels,
            createdAt: req.body.createdAt,
            inStock: !!req.body.inStock,
        }
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        await toyService.remove(toyId)
        res.send()
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToyMsg(req, res) {
    // const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const { msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}