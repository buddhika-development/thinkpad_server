import create_app from "./app.js";
import 'dotenv/config'
import config from "./config/config.js";

const PORT = config.PORT

const app = create_app()

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})