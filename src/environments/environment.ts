const API_URL = 'https://api.ingeindustrialcunoc.com/'

export const environment = {
    production: true,
    path: API_URL,
    apiPath: (API_URL) + 'v1',
    tokenCheckInterval: 5,  // minutos
    diasAtrasMovimientos: 1,
};