import { useEffect, useState } from "react";
import { getProfile } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        // PROTECCIÓN
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            const res = await getProfile();
            setData(res);
        };

        fetchData();
    }, []);

    if (!data) return <p>Cargando...</p>;

    return (
        <div className="card">
            <h2>Dashboard</h2>
            <p><strong>Usuario:</strong> {data.user}</p>
            <p><strong>Rol:</strong> {data.role}</p>
            <p><strong>Restaurante:</strong> {data.restaurant}</p>
        </div>
    );
}