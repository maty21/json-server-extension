'use strict'

const jsonData = './db.json'
const jsonConcat = require("json-concat");
const Finder = require('fs-finder');
const fsExtra = require('fs-extra');
const requireDir = require('require-dir');
const colors = require('colors');
class jsonExtender {
  constructor(options) {
    const base = __dirname;
    this.generatedPath = options.generatedPath || `${base}/generated`
    this.filePath = options.filePath;
    this.staticPath =options.staticPath||`${base}/static` ;
    this.filesToGenerate = [];
    this.startingPoint = null;
    this.outputs = [];
    this.promise = new Promise((resolve,reject)=>{
      this.resolve =resolve;
    });
  }

  register(params) {
    if(params instanceof Array ){
      this.filesToGenerate.push(...params);
    }
    else if ( typeof  params == 'string' ){
      let requires = requireDir(params);
      let funcs =  Object.keys(requires).map(key => requires[key]) ;
      this.filesToGenerate.push(...funcs);
    }
  }

  generate(isRun=true) {
    if(!isRun){
      return new Promise((resolve,reject)=>{
        return resolve({files:'',filePath:`${this.filePath}`});
      })
    }
    return new Promise((resolve,reject)=>{
      this.status = 'success';
      let prevFunc = this.extend.bind(this);
      this.filesToGenerate.reverse().map(func=> {
        this.startingPoint = prevFunc = func(prevFunc);

      })
      this.startingPoint(this.createJson.bind(this));
      this.promise.then(data=> resolve(data)).catch((e)=>reject(e));

    })

  }

  createJson(object) {
    let absolutePath = `${this.generatedPath}/${object.path}`;
    fsExtra.outputJSONSync(absolutePath, object.data, null, (err) => {
      console.log(err) // => null

    })

  }


  extend(arr) {

    let generatedFiles = Finder.from(`${this.generatedPath}`).findFiles('*.json');
    let staticFiles = Finder.from(`${this.staticPath}`).findFiles('*.json');
    let files = [...staticFiles,
      ...generatedFiles]
      jsonConcat({
        src: [
          jsonData,
          ...files
        ],
        dest: this.filePath
      },  (json)=> {
        console.log('___________________________________________________________________________________________'.green)
        console.log(`finished successfuly`.green)
        console.log(`the files created and combined:`.green)
        let counter = 1;
        files.map((file)=>{
            console.log(` ${counter}) ${file}`.green)
            counter++;
        })
        console.log(`the result saved to ${this.filePath} `.green)
        console.log('___________________________________________________________________________________________'.green)
        this.resolve({files:`${files}`,filePath:`${this.filePath}`});
      });

    }

  }

  module.exports = jsonExtender;
