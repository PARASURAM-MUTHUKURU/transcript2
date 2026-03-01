FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port Vite runs on (default 5173)
EXPOSE 5173

# Run the application in dev mode with host=0.0.0.0 for accessibility
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
