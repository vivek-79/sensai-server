import app from "./app";
import { variables } from './constants';


const port = variables.port || 4000

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`)
});
