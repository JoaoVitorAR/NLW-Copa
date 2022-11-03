import { prisma } from './../lib/prisma';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function authRoutes(fastify: FastifyInstance) {
    
    //antes de chamar rota /me ele ira executar o pluigin authenticate, e se o usario nao estiver autienticado o request nao executa
    fastify.get('/me', {
        onRequest: [authenticate]
    }, async (request) => { 
        return{ user: request.user}
    })

    fastify.post('/users', async (request) => {

        const createUserBody = z.object({
            //impede que o access_token esteja nulo antes de ser enviado para o banco
            access_token: z.string(), 
        })

        const { access_token } = createUserBody.parse(request.body)

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { 
            //chamando api do google que retorna dados do usuario logado 
            method: 'GET',
            headers: {
                //enviando o access como um cabeçalho de autorização, entendendo quem esta logado
                Authorization: `Bearer ${access_token}`
            }
        })


        const userData = await userResponse.json()

        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url(),
        })

        //Fazendo uma validação se os dados que vem da api do google estao corretos com os dados do userInfoSchema 
        const userInfo = userInfoSchema.parse(userData) 

        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id
            }
        })

        if (!user){ //se usuario nao cadastro, metodo realiza a criação
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture
                }
            })
        }

        const token = fastify.jwt.sign({
            name: user.name,
            avatarUrl: user.avatarUrl
        }, {
            sub: user.id,
            expiresIn: '7 days',
        })

        return { token }

    })
}