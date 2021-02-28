import { Request, Response } from "express"
import { resolve } from "path"
import { getCustomRepository } from "typeorm"
import { AppError } from "../errors/AppErrors"
import { SurveysRepository } from "../Repositories/SurveysRepository"
import { SurveysUsersRepository } from "../Repositories/SurveysUsersRepository"
import { UsersRepository } from "../Repositories/UsersRepository"
import SendMailService from "../services/SendMailService"
import * as yup from "yup"

class SendMailController {

    async execute(request: Request, response: Response) {
        try {
            const schema = yup.object().shape({
                email: yup.string().email().required(),
                survey_id: yup.string().uuid().required()
            })

            const { email, survey_id } = await schema.validate(request.body)

            const usersRepository = getCustomRepository(UsersRepository)
            const surveysRepository = getCustomRepository(SurveysRepository)
            const surveysUsersRepository = getCustomRepository(SurveysUsersRepository)

            const user = await usersRepository.findOne({ email })

            if (!user) {
                throw new AppError("User does not exists!")
            }

            const survey = await surveysRepository.findOne({
                id: survey_id
            })

            if (!survey) {
                throw new AppError("User does not exists!")
            }


            const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs")

            const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
                where: { user_id: user.id, value: null },
                relations: ["user", "survey"],
            })

            const variables = {
                name: user.name,
                title: survey.title,
                description: survey.description,
                id: "",
                link: process.env.URL_MAIL,

            }

            if (surveyUserAlreadyExists) {
                variables.id = surveyUserAlreadyExists.id
                await SendMailService.execute(email, survey.title, variables, npsPath)
                return response.json(surveyUserAlreadyExists)
            }

            const surveyUser = surveysUsersRepository.create({
                user_id: user.id,
                survey_id
            })

            await surveysUsersRepository.save(surveyUser)



            variables.id = surveyUser.id
            await SendMailService.execute(email, survey.title, variables, npsPath)
            return response.json(surveyUser)
        } catch (err) {
            return response.status(400).json({ error: err.message })
        }
    }
}

export { SendMailController }