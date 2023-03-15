
# DockerUI

## Description

DockerUI is a web application for managing Docker containers. With it, you can create a new container based on selected, existing images and delete or reset the existing one. The application shows when the process was started, when it was finished and how long it was lasted. In the main view of the application, we have access to basic information about all containers, while on the appropriate subpages we have access to a view with detailed information about the selected container.
The visual side of the application was created based on bootstrap-grid.

## How it works
The application connects to the unix Docker socket using the Dockerode framework. With its use, I can easily implement the necessary functionalities in my application. The server stuff is built with the basic features of express.js. The frontend part was created in pure JS with templates in PUG.

## Usage tutorial
### Create container
1. In the *Name* field, enter a name for the new container. Remember the name must be unique.
2. In the *Image* field, enter a name for the new container.
3. Click the *Run* button. The **Status** section will change from *idle...* to *loading...*. When the container creation is complete, the *Refresh* button will appear. When you click it, a new container will be added to the **Container List**. Information about the process will appear in the **Logs** section.
### Delete container
1. In Containers List, we have the Actions section. After clicking on the *Bin* icon at the selected container, the process of deleting the container will start.
   
    *OR*

    You can writhe in URL bar:
    ```
    hostname:port/containers/:containerName/delete
    ```
    
    The **Status** section will change from *idle...* to *loading...*. When the container deleting is complete, the *Refresh* button will appear. When you click it, selected container will be removed from the **Container List**. Information about the process will appear in the **Logs** section.

### Restart container
1. In Containers List, we have the Actions section. After clicking on the *Restart* icon at the selected container, the process of restarting the container will start.
   
    *OR*

    You can writhe in URL bar:
    ```
    hostname:port/containers/:containerName/restart
    ```

The **Status** section will change from *idle...* to *loading...*. When the container restarting is complete, the *Refresh* button will appear. When you click it, selected container will be restarted and its *Up for* section will be change for new one. Information about the process will appear in the **Logs** section.
### Information about container
To see detailed information about the container, click on its *name*. We will be redirected to the subpage containing this information. To return to the home page, click the *Return* button.

## Development
1. Start Docker.
2. Download *[this](https://github.com/KamilTargonski/DockerUI)* repository.
3. Download app image from *[my docker.hub](https://hub.docker.com/r/kamiltargonski/dockerui/tags)*.
4. Write this command in your console
    ```
    docker run -v /var/run/docker.sock:/var/run/docker.sock -v <repo path>/app.js:/app/app.js -v <repo path>/views:/app/views -v <repo path>/public:/app/public -d -p 8080:8080 --name dockerui kamiltargonski/dockerui:v1
    ```
5. Enjoy the app!






