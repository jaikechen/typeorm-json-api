import { Request, Response } from "express";
import express from "express";
import { Connection, ConnectionOptions, createConnection  } from "typeorm";
import { parseQueryParam } from "./queryPrarms";
import { mylog } from "../utilities/mylogger";


let repoOrmConfig: ConnectionOptions
export const setOrmConfig = (config:any) => repoOrmConfig = config

let repoConn: Connection
async function getConnection (){
    repoConn = repoConn ?? await createConnection(repoOrmConfig)
    return repoConn
}



async function getRepo (req:Request){
    const conn = await getConnection()
    const repoName = req.params.repo
    const repo = await conn.getRepository(repoName)
    return repo
}

export const repoRouter = express.Router()
repoRouter.use(express.json())

repoRouter.get('/:repo', async (req, res) => {
    const findOption = parseQueryParam(req.query)
    mylog(findOption)
    const repo =await getRepo(req)
    const result = await repo.findAndCount(findOption)
    res.json(result)
})

repoRouter.get('/:repo/:id', async (req:Request, res:Response) => {
    const repo = await getRepo(req)
    const id = req.params.id
    const item = await repo.findOne(id)
    if (!item){
        res.sendStatus(401)
    }
    res.json(item)
})

repoRouter.post("/:repo", async function(req: Request, res: Response) {
    const repo = await getRepo(req)
    const user = await repo.create(req.body);
    const results = await repo.save(user);
    return res.send(results);
});

repoRouter.put("/:repo/:id", async function(req: Request, res: Response) {
    const repo = await getRepo(req)
    const id = req.params.id
    const user = await repo.findOne(id);
    repo.merge(user, req.body);
    const results = await repo.save(user as any);
    return res.send(results);
});

repoRouter.delete("/:repo/:id", async function(req: Request, res: Response) {
    const repo = await getRepo(req)
    const id = req.params.id
    const results = await repo.delete(id);
    return res.send(results);
});
