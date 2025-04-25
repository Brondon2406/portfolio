import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  adminUsername: process.env.ADMIN_USERNAME || 'brondonfopa',
  adminPassword: process.env.ADMIN_PASSWORD || 'brondonfopa@698',
  jwtSecret: process.env.JWT_SECRET || '53Xjx4,8a:-MfLs=[M`V()P!%C?}Gi_W}14@"n$&xgfaT!>y6Cf9:dgEx%k/"Pa'
};