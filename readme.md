# DockerUI

## Description
DockerUI is a web application for managing Docker containers by communicating with systems existing docker.socket. With it, you can create a new container based on selected, existing images and delete or reset the existing one. The application shows when the process was started, when it was finished and how much time it took. In the main view of the application, we have access to basic information about all containers, while on the appropriate subpages we have access to a view with detailed information about the selected container.

## How it works
The application connects to the unix Docker socket using the Dockerode framework. With its use, you can easily implement the necessary functionalities in my application. The server stuff is built with the basic features of express.js. The frontend part was created in pure JS with templates in PUG. </br> The visual side of the application was created based on bootstrap-grid.

### Tech stack:
- [Dockerode js library](https://github.com/apocas/dockerode)
- [ExpressJS docs](https://expressjs.com/)
- [PUG docs](https://pugjs.org/api/getting-started.html)
- [Dockerfile docs](https://docs.docker.com/engine/reference/builder/)
- [Bootstrap 3.4.1 docs](https://getbootstrap.com/docs/3.4/)

## How to use
1. Start Docker.
2. Write this command in your console:
    ```
    docker run -v /var/run/docker.sock:/var/run/docker.sock -d -p 8080:8080 --name dockerui kamiltargonski/dockerui:v1
    ```
3. Write in the search bar of your browser:
   ```
   http://localhost:8080/
   ```
4. Enjoy the app!

## Usage tutorial
### Information about container
To see detailed information about the container, click on its *name*. You will be redirected to the subpage containing this information. To return to the home page, click the *Return* button.

### Create container
1. In the *Name* field, enter a name for the new container. Remember that name must be unique.
2. In the *Image* field, enter an image for the new container.
3. Click the *Run* button. 

### Delete container
1. In Containers List, we have the Actions section. After clicking on the *Bin* icon at the selected container, the process of deleting the container will start.
   
    *OR*

    You can write in URL bar:
    ```
    hostname:port/containers/:containerName/delete
    ```
   
### Restart container
1. In Containers List, we have the Actions section. After clicking on the *Restart* icon at the selected container, the process of restarting the container will start.
   
    *OR*

    You can write in URL bar:
    ```
    hostname:port/containers/:containerName/restart
    ```
### Status and logs

#### Status
After performing the above-mentioned actions, the **Status** section will change from *idle...* to *loading...* with number of current processes. When the selected process is completed, the *Refresh* button will appear. Depending on the selected action, when you click it, the following will happen: 
   - *Create container* - a new container will be added to the **Container List**.
   - *Delete container* - selected container will be removed from the **Container List**.
   - *Restart container* - selected container will be restarted and its *Up for* section in the **Container List** will be change for new one.

#### Logs
This section shows all the information about the operations performed by the app. These are:
- starting the process,
- completion of the process with its duration,
- all errors caught by the app.

Each log is provided with the time of its creation.
