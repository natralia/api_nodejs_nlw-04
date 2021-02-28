import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { SurveysRepository } from "../Repositories/SurveysRepository"
import * as yup from "yup"

class SurveysController {
    async create(request: Request, response: Response) {
        try {
            const schema = yup.object().shape({
                title: yup.string().required(),
                description: yup.string().required()
            })

            const { title, description } = await schema.validate(request.body)

            const surveysRepository = getCustomRepository(SurveysRepository)

            const survey = surveysRepository.create({
                title,
                description
            })

            await surveysRepository.save(survey)

            return response.status(201).json(survey)
        } catch (err) {
            return response.status(400).json({ error: err.message })
        }
    }
    async show(request: Request, response: Response) {
        const surveysRepository = getCustomRepository(SurveysRepository)

        const all = await surveysRepository.find()

        return response.json(all)
    }
}

export { SurveysController }
