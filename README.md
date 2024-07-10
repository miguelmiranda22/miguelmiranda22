# PSI

# Versoes usadas:

Angular 16 - confirmar versao instalada no appserver
Node v16.14.2
npm v8.5.0
MongoDB v5.0.6

# Portos

Front-end: 3030
Back-end: 3080

# Correr no appserver

Appserver: ssh PSI030@appserver.alunos.di.fc.ul.pt
    username PSI030
    password inicial PSI030

Mongo dentro do server: mongo --username psi030 --password --authenticationDatabase psi030 appserver.alunos.di.fc.ul.pt/psi030

'npm install' no front e back end antes de executar pela primeira vez

Instalar angular no front-end no appserver: npm install @angular/cli
    Adicionar o ng ao PATH do front-end

ng serve --port 3030 --host 0.0.0.0 --disable-host-check true
 
export PATH="/home/PSI030/psi/psi030/node_modules/.bin/:$PATH"

npm devstart

mongo --username psi030 --password --authenticationDatabase psiXXX
appserver.alunos.di.fc.ul.pt/psiXXX

Connection String MongoDB: mongodb://psi030@localhost:27017/psi030?retryWrites=true&authSource=psi030

# node_modules
Colocar node_modules no git ignore

