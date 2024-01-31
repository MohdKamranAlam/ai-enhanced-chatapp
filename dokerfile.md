## The process of using Docker to set up the backend, frontend, and database for your application, you can follow these detailed steps. Docker installed on your machine.

## Step 1: Image Names

    The each part of the application (backend, frontend, and database) has a corresponding Docker image hosted on Docker Hub with the following names:

        Backend: kamranbulls/aichtbot-backend:latest
        Frontend: kamranbulls/ai-enhanced-chatapp-frontend:latest
        Database (Postgres): kamranbulls/mypostgres:latest
        These images are pre-built versions of each component of the application.

## Step 2: Pulling the Docker Images
    To open a terminal or command prompt and execute the following commands to pull the images from Docker Hub:

        docker pull kamranbulls/aichtbot-backend:latest
        docker pull kamranbulls/ai-enhanced-chatapp-frontend:latest
        docker pull kamranbulls/mypostgres:latest
        These commands will download the latest versions of the backend, frontend, and database images to the client's machine.

## Step 3: Running the Docker Containers
    Now you can run each component as a separate container. The ports in the docker run commands below have been updated to match those specified in your docker-compose.yml file:

    docker run -d --name backend -p 8084:8084 kamranbulls/aichtbot-backend:latest
    docker run -d --name frontend -p 3000:80 kamranbulls/ai-enhanced-chatapp-frontend:latest
    docker run -d --name mypostgres -e POSTGRES_PASSWORD=kamran1234 -v mydbdata:/var/lib/postgresql/data -p 5433:5432 kamranbulls/mypostgres:latest

    The backend service is accessible on port 8084.
    The frontend service is accessible on port 3000.
    The Postgres database is accessible on port 5433 on the host machine, mapping to port 5432 on the container.

## Additional Notes:

    Volumes: The -v mydbdata:/var/lib/postgresql/data part of the Postgres docker run command ensures that the database data is persisted in a Docker volume named mydbdata. This means that if the container is stopped or deleted, the data won't be lost.

    Detached Mode: The -d flag in the docker run commands runs the containers in detached mode, meaning they run in the background and won't block the terminal.

    Environment Variables: The -e POSTGRES_PASSWORD=kamran1234 part sets the database password to kamran1234. This should match the password expected by the backend application.

## Accessing the Application:
    Finally, let your client know that once all containers are up and running, they can access the frontend of the application by   opening a web browser and navigating to http://localhost:3000. The backend APIs will be accessible at http://localhost:8084.

Troubleshooting:
If you have any issues, they can check the logs of any container by using the following command, replacing <container_name> with the name of the container they wish to inspect (backend, frontend, or mypostgres):

