FROM node:10

LABEL applicant Tobi Okedeji <okedejitobi@gmail.com>

WORKDIR /www/NodeChallenge

# For babel
RUN npm install babel-cli -g

# Caching 
COPY package*.json ./
RUN npm install

# Copy API files
COPY . .

# Expose port
EXPOSE 80

# Entrypoint script
RUN cp turing-entrypoint.sh /usr/local/bin/ && \
    chmod +x /usr/local/bin/turing-entrypoint.sh

ENTRYPOINT ["sh", "/usr/local/bin/turing-entrypoint.sh"]