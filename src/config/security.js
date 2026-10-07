import helmet from 'helmet';

const securityMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
};

export default securityMiddleware;