import express from "express"
import { User } from "../../models/users.js"
import checkJwt from "../../middlewares/checkJwt.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const usersRouter = express.Router()
// AUTENTICAZIONE------------CONTROLLARE PASSWORD PER LOGIN E RESTITUIRE TOKEN
usersRouter
    .post("/session", async (req, res) => {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send({ message: "User not found" })
        }
        const isPasswordCorrect = bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid password" })
        }
        const payload = { id: user._id }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        })

        res.status(200).json({ token, payload, message: "Logged in" })
    })

    // ---------GET BY ID user e controllare che il token sia valido per effettuare richieste (frontend)
    .get("/:id", checkJwt, async (req, res) => {
        const user = await User.findById(req.params.id)

        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }

        // il nostro utente, dopo l'autenticazione, è disponibile dentro req.user
        // (siccome glielo abbiamo messo noi nel middleware checkJwt)

        res.status(200).json(req.user)
    })
    //   Ritorna tutti gli utenti GET
    .get("/", async (req, res, next) => {
        try {
            const users = await User.find({}).select("-password")
            if (!users) {
                return res.status(404).send()
            }

            res.json(users)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

    //POST-----Aggiungi un utente e fai HASHING della password

    .post("/", async (req, res) => {
        try {
            const { email } = req.body
            //cercao se esiste già un utente con la stessa email
            const user = await User.findOne({ email })
            if (user) {
                return res.status(400).send({ message: "Email already exists" })
            }
            const password = await bcrypt.hash(req.body.password, 10) // fai hashing della password inserita nella nel body della richiesta del form
            //Crea autore, sovrascrivendo il campo della password con quella criptata
            const newuser = await User.create({
                ...req.body,
                password,
            })

            // Rimuov0 il campo 'password' prima di inviarlo nella risposta
            const userWithoutPassword = {
                _id: newuser._id,
                firstName: newuser.firstName,
                lastName: newuser.lastName,
                email: newuser.email,
            }

            await newuser.save()
            if (newuser) {
                res.status(201).send(userWithoutPassword)
            } else {
                next(error)
            }
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    })

export default usersRouter
