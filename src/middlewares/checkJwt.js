import jwt from "jsonwebtoken"
import { User } from "../models/users.js"

// Encoded !== encrypted
// Un pezzo del nostro JWT token è CODIFICATO in base64
// ma non è criptato, quindi è leggibile da chiunque
//Andiamo a prendere dal token
const checkJwt = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1] // Prendo il token dagli HEADERS: Authorization sotto forma di  "Bearer <token>", lo divido in due array usando lo spazio come separatore(split) e accedo all'array di indice [1]() questo per eliminare Bearer dall'analisi
        const payload = jwt.verify(token, process.env.JWT_SECRET) // openssl rand -hex 64 verifico nel TOKEN che la SIGNATURE corrisponda alla nostra JWT_SECRET

        req.user = await User.findById(payload.id).select("-password") //Cerco l'autore con attraverso l'id preso nel payload e restituisco in "req.user" tutti i dati del modello user tranne la password

        if (!req.user) {
            return res.status(404).json({ message: "User not found" })
        }

        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" })
    }
}

export default checkJwt
