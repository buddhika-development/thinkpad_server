import create_app from "./app.js";
import 'dotenv/config'

const PORT = process.env.PORT || 8080

const app = create_app()

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})