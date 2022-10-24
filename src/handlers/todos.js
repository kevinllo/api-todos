import express from "express"
import { getDBHandler } from "../db/index.js";

const ToDosRequestHandler = express.Router();
ToDosRequestHandler.post("/to-dos", async (request, response) => {
    try {
        const { title, description, isDone: is_done } = request.body;
        const dbHandler = await getDBHandler();
        const newTodo = dbHandler.run(`
        INSERT INTO todos (title, description, is_done)
        VALUES (
            '${title}', 
            '${description}',
            ${is_done})
        `);
        await dbHandler.close();
        response.send({
            newTodo: { title, description, is_done, ...newTodo }
        })
    } catch (error) {
        response.status(500).send({
            error: "Something went wrong when trying to create a to-do",
            errorinfo: error.message
        })
    }
});
ToDosRequestHandler.get("/to-dos", async (request, response) => {
    try {
        const dbHandler = await getDBHandler();
        const toDos = await dbHandler.all("SELECT * FROM todos");
        await dbHandler.close();
        if (!toDos || !toDos.length) {
            return response.status(404).send({ message: "To-dos not found" });
        }
        response.send({
            todos: toDos
        })
    } catch (error) {
        response.status(500).send({
            error: "Something went wrong when trying to get a to-do",
            errorinfo: error.message
        })
    }
});
ToDosRequestHandler.delete("/to-dos/:id", async (request, response) => {
    try {
        const todoId = request.params.id;
        const dbHandler = await getDBHandler();
        const deletedTodo = await dbHandler.run(
            "DELETE FROM todos WHERE id = ?", todoId
        )
        await dbHandler.close();
        response.send({ todoRemoved: {...deletedTodo }});
    } catch (error) {
        response.status(500).send({
            error: "Something went wrong when trying to delete a to-do",
            errorinfo: error.message
        })
    }
});
export { ToDosRequestHandler };