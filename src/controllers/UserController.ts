import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { UsersRepository } from "../Repositories/UsersRepository"
import * as yup from "yup"
import { AppError } from "../errors/AppErrors"

class UserController {
    async create(request: Request, response: Response) {
        try {
            const schema = yup.object().shape({
                name: yup.string().required(),
                email: yup.string().email().required()
            })

            const { name, email } = await schema.validate(request.body)


            const userRepository = getCustomRepository(UsersRepository)


            const userAlreadyExists = await userRepository.findOne({
                email
            })

            if (userAlreadyExists) {
                throw new AppError("User already exists!")
            }
            const user = userRepository.create({
                name, email
            })

            await userRepository.save(user)

            return response.status(201).json(user)
        } catch (err) {
            return response.status(400).json({ error: err.message })
        }
    }
}

export { UserController }
