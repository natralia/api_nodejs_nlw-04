import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveysUsersRepository } from "../Repositories/SurveysUsersRepository";
import * as yup from "yup";

class NpsController {

    /**
     * 
     * 1 2 3 4 5 6 7 8 9 10
     * Detratores => 0 - 6
     * Passivos => 7 - 8
     * Promotores => 9 - 10
     * 
     * (Número de promotores - número de Detratores) / (Número de respondentes) x 100
     */

    async execute(request: Request, response: Response) {
        try {
            const schema = yup.object().shape({
                survey_id: yup.string().uuid().required()
            })

            const { survey_id } = await schema.validate(request.body)

            const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

            const surveysUsers = await surveysUsersRepository.find({
                survey_id,
                value: Not(IsNull()),
            })
            const detractors = surveysUsers.filter(
                (survey) => survey.value >= 0 && survey.value <= 6
            ).length;
            const promoters = surveysUsers.filter(
                (survey) => survey.value >= 9 && survey.value <= 10
            ).length;
            const passives = surveysUsers.filter(
                (survey) => survey.value >= 7 && survey.value <= 8
            ).length;

            const totalAnswers = surveysUsers.length;

            const calculate = Number(
                (((promoters - detractors) / totalAnswers) * 100).toFixed(2)
            );

            return response.json({
                detractors,
                promoters,
                passives,
                totalAnswers,
                nps: calculate,
            })
        } catch (err) {
            return response.status(400).json({ error: err.message })
        }
    }
}

export { NpsController };