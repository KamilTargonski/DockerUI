const Docker = require('dockerode');
const express = require('express');

const docker = new Docker({socketPath: '/var/run/docker.sock'});
const app = express();

let inProgress = 0;
const logsList = [];

function addDataToLog (message) {
  const dateObj = new Date();
  const date = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
      .format(dateObj)
      .replace(',', '')
      .replaceAll('.', '/');
  const finalMessage = `[${date}] ${message}`
  logsList.push(finalMessage);
  console.log(finalMessage);
}

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  docker.listContainers(function (err, containers) {
    const containersList = [];

    containers.forEach(function (containerInfo) {
      let portsObj;

      if (containerInfo.Ports[0]) {
        const portsObjTrue = [];

        for (const [key, value] of Object.entries(containerInfo.Ports[0])) {
          const keysAngValue = (` ${key}: ${value}`);
          portsObjTrue.push(keysAngValue);
        }
        portsObj = portsObjTrue;
      }

      const unixTimestamp = containerInfo.Created;
      const timeInMS = new Date().getTime() - new Date(unixTimestamp * 1000).getTime();
      const seconds = Math.floor(timeInMS / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      let formattedTime;

      if (days > 0) {
        formattedTime = days + 'd';
      } else if (hours > 0) {
        formattedTime = hours + 'h';
      } else if (minutes > 0) {
        formattedTime = minutes + 'm';
      } else {
        formattedTime = seconds + 's';
      }

      const containerObj = {
        name: containerInfo.Names[0]
            .replace('/', ''),
        image: containerInfo.Image,
        command: containerInfo.Command,
        status: containerInfo.State,
        ports: portsObj,
        upFor: containerInfo.Status
            .replace('Up ', '')
            .replace(' seconds', 's')
            .replace(' minutes', 'm')
            .replace(' hours', 'h')
            .replace(' days', 'd'),
        age: formattedTime
      };

      containersList.push(containerObj);
    });

    res.render('bootstrap.pug', { containersList: containersList, logsList: logsList, inProgress: inProgress });
  });
});

app.post('/', async function (req, res) {
  if (!req.body.image) {
    req.body.image = 'undefined';
  }

  ++inProgress;
  const startDateObj = new Date();
  addDataToLog(`Creating container named ${req.body.name}...`);
  let errorCaught = false;
  await docker.createContainer({Image: `${req.body.image}`, Cmd: ['/bin/sh', '-c', 'tail -f /dev/null'], name: `${req.body.name}`})
      .then(function (container) {
        container.start();
      })
      .catch(async err => {
        await new Promise(r => setTimeout(r, 500));
        addDataToLog(err);
        --inProgress;
        const endDateObj = new Date();
        const time = endDateObj.getTime() - startDateObj.getTime();
        addDataToLog(`Container ${req.body.name} was not created [time: ${time}ms]`);
        errorCaught = true
      });

  if (!errorCaught) {
    let isCreated;

    do {
      docker.listContainers((err, containers) => {
        isCreated = containers.find(containerInfo => containerInfo.Names[0].replace('/', '') === req.body.name);
      });

      await new Promise(r => setTimeout(r, 1000));

    } while (!isCreated);
    --inProgress;
    const endDateObj = new Date();
    const time = endDateObj.getTime() - startDateObj.getTime();
    addDataToLog(`Container ${req.body.name} was created [time: ${time}ms]`);
  }
});

app.get('/containers/:containerName', (req, res) => {
  const containerName = req.params.containerName;

  docker.listContainers((err, containers) => {
    const filteredContainers = containers.find(containerInfo => containerInfo.Names[0].replace('/', '') === containerName);
    if (!filteredContainers) {
      const errMessage = `Error! Container with name ${containerName} does not exist!`;
      addDataToLog(errMessage);
      res.send(errMessage);
    }

    containers.forEach((containerInfo) => {
      const detailedContainer = {
        id: containerInfo.Id,
        names: containerInfo.Names,
        images: containerInfo.Image,
        imageId: containerInfo.ImageID,
        command: containerInfo.Command,
        created: new Date(containerInfo.Created * 1000).toLocaleString('pl-PL', {timeZone: 'Europe/Warsaw'}),
        ports: containerInfo.Ports,
        labels: containerInfo.Labels,
        state: containerInfo.State,
        status: containerInfo.Status,
        hostConfig: containerInfo.HostConfig,
        networkSettings: containerInfo.NetworkSettings,
        mounts: containerInfo.Mounts
      }

      res.render('containerInfo.pug', {title: `${req.params.containerName}`, info: detailedContainer});
    });
  });
});

app.get('/containers/:containerName/delete', async (req, res) => {
  ++inProgress;
  const containerName = req.params.containerName;
  const startDateObj = new Date();
  addDataToLog(`Deleting container ${containerName}...`);

  docker.listContainers((err, containers) => {
    const deletingContainer = containers.find(containerInfo => containerInfo.Names[0].replace('/', '') === containerName);

    if (!deletingContainer) {
      const errorMessage = `Delete error! Container with name ${containerName} does not exist!`;
      addDataToLog(errorMessage)
      res.send(errorMessage);
    }

    const containerToDelete = docker.getContainer(deletingContainer.Id);
    containerToDelete.remove({v: true, force: true});
  });

  let stillExists;

  do {
    docker.listContainers( (err, containers) => {
      stillExists = containers.find(containerInfo => containerInfo.Names[0].replace('/', '') === containerName);
    });

    await new Promise(r => setTimeout(r, 500));

  } while (stillExists);
  --inProgress;
  const endDateObj = new Date();
  const time = endDateObj.getTime() - startDateObj.getTime();
  addDataToLog(`Container ${containerName} was deleted [time: ${time}ms]`);
});

app.get('/containers/:containerName/restart', async (req, res) => {
  ++inProgress;
  const containerName = req.params.containerName;
  const startDateObj = new Date();
  addDataToLog(`Restarting container named ${containerName}...`);

  docker.listContainers( (err, containers) => {
    const restartingContainer = containers.find(containerInfo => containerInfo.Names[0].replace('/', '') === containerName);

    if (!restartingContainer) {
      const errorMessage = `Restart error! Container with name ${containerName} does not exist!`;
      addDataToLog(errorMessage);
      res.send(errorMessage);
    }

    const containerToRestart = docker.getContainer(restartingContainer.Id);
    containerToRestart.restart();
  });

  let currentStatus;

  do {
    docker.listContainers((err, containers) => {
      const currentRestartsContainer = containers.find(containerInfo => containerInfo.Names[0].replace('/', '') === containerName);

      if (currentRestartsContainer) {
        currentStatus = currentRestartsContainer.Status;
      }
    });

    await new Promise(r => setTimeout(r, 250));

  } while(currentStatus !== 'Up Less than a second');
  --inProgress;
  const endDateObj = new Date();
  const time = endDateObj.getTime() - startDateObj.getTime();
  addDataToLog(`Container ${containerName} was restarted [time: ${time}ms]`);
});

app.get('/isloading', (req, res) => {
  res.send(`${inProgress}`);
});

app.get('/logging', (req, res) => {
  res.send(logsList);
});

app.route('*').all((req, res) => {
  const errorMessage = `Error 404: path ${req.path} not found`;

  addDataToLog(errorMessage);
  res.status(404).send(errorMessage);
});

app.listen(8080, '0.0.0.0');
