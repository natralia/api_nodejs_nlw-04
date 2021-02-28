import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppErrors";
import { SurveysUsersRepository } from "../Repositories/SurveysUsersRepository";
import * as yup from "yup";

class AnswerController {

    //http://localhost:3333/answers/2?u=52fe3bad-7c55-446e-9a8c-e4a160f6dc9d

    async execute(request: Request, response: Response) {
        try {
            const paramsSchema = yup.object().shape({
                value: yup.string().required()
            })
            const querySchema = yup.object().shape({
                u: yup.string().uuid().required()
            })
    
            const { value } = await paramsSchema.validate(request.params)
            const { u } = await querySchema.validate(request.query)
    
            const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
            const surveyUser = await surveysUsersRepository.findOne({
                id: String(u)
            });
    
            if (!surveyUser) {
                throw new AppError("Survey User does not exists!")
    
            }
    
            surveyUser.value = Number(value);
    
            await surveysUsersRepository.save(surveyUser);
    
            return response.json(surveyUser);
        } catch (err) {
            return response.status(400).json({ error: err.message })
        }
    }
}

export { AnswerController }