# json-server-extension

json-server is great for stub server usage
but in my opinion there where some caveat that i tried to solve in this package

### so what this package gives you
- [x] **splitting to static files -**   json-server can serve only single file but in medium/large applications it not ideal, by using this package you can split your json object to files
- [x] **dynamic generation -**  with json server you can generate the whole file
  now you can create multiple generated objects decoupled each other and even combine
  static and generated files

## Example
full example can be found here https://github.com/maty21/json-server-extension-example
### init example
```js
const jsonServer = require('json-server');
const _jsonExtender = require('./jsonExtender');

//options:
//fullPath:fullpath for the combined object
//generatedPath:the path where the generated files will be found
//staticPath:the path where the static files will be found
const jsonExtender = new _jsonExtender({filePath:'./db_extends.json',
                                        generatedPath:'./generated',
                                        staticPath:'./static'})

//register accept array of generators or path to the generator scripts
//const funcs =  Object.keys(generators).map(key => generators[key])
jsonExtender.register('../../../generators');
jsonExtender.generate().then((data)=>{
  console.log(`wow ${data}`);
  var server = jsonServer.create()
  var router = jsonServer.router('./db_extends.json')
  var middlewares = jsonServer.defaults()

  server.use(middlewares)
  server.use(router)
  server.listen(4000, function () {
    console.log('JSON Server is running')
  }).catch((err) => {console.log(err)})

});
```
### generator Example

```js
const amount = 100;
 const func =next =>create => {
    const path = `feed/feedList.json`;
    const data = (amount)=> {
        let temp = [];
        for (let i = 0; i < amount; i++) {
            temp.push({
                    id: `${i}N12134`,
                    newNotificationCount: i * 3,
                    isRead: (i % 2 == 0),
                    isStarMark: (i % 4 == 0),
                    iconType: "SocialNotifications",
                    description: i + ": this is a new  feed ",
                    date: new Date(Date.now()).toLocaleString()
                }
            )
        }
        return temp;
    }
    create({data: {feed: data(amount)}, path: path})
    next(create);

}
module.exports = func;
```


## api

#### constructor
``constructor({filePath:'string',generatedPath:'string, staticPath:'string'}) ``
- ``fullPath``- fullpath for the combined object
- ``generatedPath``- the path where the generated files will be found ``default
: './generated'``
- ``staticPath``- the path where the static files will be found  ``default
: './static'``

#### register
``register('path name') / register([...generator scripts]) ``
- ``register('path name')`` - a path where the generators scripts will be found the package will insatiate the scripts automatically
- ``register([...generator scripts])`` -array of your generators after requiring them manually

#### generate
``generate(isRun[default:true]) return promise``
- ``isRun`` - there is ability to not generate the db.json each time good when you want to save the state after you close the process the promise will recive the same data so you will not have to change the code
- ``promise``
  - ``resolve`` -{files:array of combined files, filePath:the combined file path }
  - ``reject``- error

### generator

``` const func= next =>create => {}``` - the generator should be initiated as follows first you will have to call for create this is sync function and the for next
- ``create({data: {feed: generatedObject}, path: path})``
    - ``data`` - the generated data where the name of the property will be the routing name in this case ``feed``
    - ``path`` - a relative path under the generated path that you set in the constructor where you wish to put the output
- ``next(create)`` - just pass the create function there so it's reference will be passed  in the pipeline
