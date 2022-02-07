import { Express, Request, Response } from 'express';

export const handleRoutes = (app: Express) => {

  // =====================================================================================
  // REST API routes
  // =====================================================================================
  
  app.get('/api/status', (_request: Request, response: Response) => {
    response.send({ status: 'some status here' });
  })

}