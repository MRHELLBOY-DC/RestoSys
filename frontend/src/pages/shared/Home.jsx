import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Home() {
    return (
       <div>
            <Navbar />

            <div className="home">
                <h1>Menu Digital</h1>
                <p>Gestiona restaurantes y pedidos fácilmente</p>

                <div className="hero">
                    <h2>Encuentra tu comida favorita </h2>
                    <p>Explora restaurantes, haz pedidos y disfruta</p>
                </div>
            </div>
        </div>
    );
}