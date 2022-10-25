import express from "express";
import { getDBHandler } from "../db/index.js";

const ToDosRequestHandler = express.Router();

ToDosRequestHandler.post("/to-dos", async (request, response)=> {
    try{
        const {title, description, isDone: is_done} = request.body;
        const dbHandler = await getDBHandler()

        const newTodo = await dbHandler.run(`
            INSERT INTO todos (title, description, is_done)
            VALUES (
                '${title}',
                '${description}',
                ${is_done}
            )
        `);

        await dbHandler.close();

        response.send({newTodo: {title, description, is_done, ...newTodo}})
    }catch (error){
        response.status(500).send({
            error: `Something went wrong when trying to create a new to-do`,
            errorInfo: error.message,
        })
    }
});

ToDosRequestHandler.get("/to-dos", async (request, response)=> {
    try{
        const dbHandler = await getDBHandler();

        const todos = await dbHandler.all("SELECT * FROM todos")
        await dbHandler.close();

        if(!todos || !todos.length){
            return response.status(404).message({message: "To dos not found"})
        }

        response.send({ todos })
    }catch (error){
        response.status(500).send({
            error: `Something went wrong when trying to get to-dos`,
            errorInfo: error.message,
        })
    }
});

ToDosRequestHandler.delete("/to-dos/:id", async (request, response)=> {
    try{
        const todoId = request.params.id;
        const dbHandler = await getDBHandler();

        const deletedTodo = await dbHandler.run(
            "DELETE FROM todos WHERE id = ?",
            todoId
        );

        await dbHandler.close();

        response.send({ todoRemoved: {...deletedTodo }});
    }catch (error){
        response.status(500).send({
            error: `Something went wrong when trying to delete to-dos`,
            errorInfo: error.message,
        })
    }
});

ToDosRequestHandler.patch("/to-dos/:id", async (request, response)=> {
    try{
        const id = request.params.id;
        const {title, description, is_done} = request.body;
        const dbHandler = await getDBHandler();

        const todoToUpdate = await dbHandler.get(`
            SELECT * FROM todos WHERE id = ?`,
            id);
        let isDone = is_done ? 1 :0        
        await dbHandler.run(
            `
            UPDATE todos SET title = ?, description = ?, is_done = ?
            WHERE id = ?
            `, 
            title || todoToUpdate.title, 
            description || todoToUpdate.description, 
            isDone,
            id);

        await dbHandler.close();

        response.send({ 
            todoUpdated: {...todoToUpdate, title, description, is_done} 
        });
    }catch (error){
        response.status(500).send({
            error: `Something went wrong when trying to update a to do`,
            errorInfo: error.message,
        })
    }
});

export { ToDosRequestHandler };
