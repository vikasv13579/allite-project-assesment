import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import {Express} from 'express'
export const setupSwagger = (app: Express): void=>{
   try {
    const swaggerPath = path.resolve(process.cwd(), 'swagger.yaml')
    const swaggerDocument = YAML.load(swaggerPath)
    app.use('api/docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    console.log('Swagger Ui available at http://localhost:5000/api-docs')
   } catch (error) {
    console.log('failed to load swagger ui',error)
   }
} 