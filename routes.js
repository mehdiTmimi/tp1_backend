
const fs=require('fs')
let jokes=[];
fs.promises.readFile("db.json").
    then(data=>{
       jokes=JSON.parse(data);
    })
let index=0;
fs.promises.readFile('index.txt').then(data=>index=parseInt(data))
const handler = (request, response) => {
  const url = request.url;
  const method = request.method;
  if(method==="GET" && url==="/jokes")
  {
        response.setHeader("content-type","application/json")
        response.write(JSON.stringify(jokes))
        response.end();

  }
  if(method==="POST" && url==="/jokes")
  {
    const tab=[];
    request.on("data",chunk=>{
        tab.push(chunk)
    })
    request.on("end",async ()=>{
        let obj=JSON.parse(Buffer.concat(tab).toString());
        //verification
        if(obj.author && obj.joke)
        {          
           index=index+1;
           obj.id=index;
           await fs.promises.writeFile('index.txt',index);
           jokes.push({id:obj.id,author:obj.author,joke:obj.joke});
           await fs.promises.writeFile('db.json',JSON.stringify(jokes));
            response.setHeader("content-type","application/json");
            response.write(JSON.stringify(obj));
            return response.end();
        }
        else{
            response.setHeader("content-type","text/html");
            response.write("error");
            return response.end();
        }
    })
  }
  if(method==="GET" && url.indexOf("/delete_joke?id=")==0)
  {
    let id=url.split("=")[1];
    jokes=jokes.filter(item=>{
        return item.id!=id;
    })
    fs.promises.writeFile('db.json',JSON.stringify(jokes)).
    then(()=>{
        response.setHeader("content-type","application/json");
        response.write(JSON.stringify({message:"deleted with success"}));
        return response.end();
    })
         
  }
};
module.exports = handler;
