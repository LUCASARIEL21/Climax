import React, { useState } from "react";
import { FaWind, FaSearch, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { FaDroplet } from "react-icons/fa6";
import "./index.css";

const apiKeyWeather = import.meta.env.VITE_KEY_WEATHER;
const apiKeyPexels = import.meta.env.VITE_PEXELS_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");

  const getWeatherData = async (city) => {
    setLoading(true);
    setError(false);
    setWeatherData(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKeyWeather}&lang=pt_br`
      );

      if (!response.ok) {
        throw new Error("Cidade não encontrada");
      }

      const data = await response.json();
      setWeatherData(data);

      getCityImage(city);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getCityImage = async (city) => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${city}&per_page=1`,
        {
          headers: {
            Authorization: apiKeyPexels,
          },
        }
      );
      const data = await response.json();

      if (data.photos.length > 0) {
        setBackgroundImage(data.photos[0].src.original);
      }
    } catch (error) {
      console.error("Erro ao buscar imagem da cidade:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city) {
      getWeatherData(city);
    }
  };

  const handleSuggestionClick = (suggestedCity) => {
    setCity(suggestedCity);
    getWeatherData(suggestedCity);
  };

  return (
    <div
      className={`flex justify-center items-center h-screen transition-all duration-500 ${
        backgroundImage ? "bg-cover bg-center" : "bg-gradient-to-b from-indigo-600 to-sky-300"
      }`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="bg-indigo-700 bg-opacity-90 text-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
        <form onSubmit={handleSearch} className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Confira o clima de uma cidade:</h3>
          <div className="flex">
            <input
              type="text"
              placeholder="Digite o nome da cidade..."
              className="flex-1 p-3 text-black rounded-md outline-none"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              type="submit"
              className="p-3 ml-2 bg-sky-400 text-white rounded-md hover:bg-sky-500 transition"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center mt-4">
            <FaSpinner className="animate-spin text-2xl" />
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <p className="text-red-500 mt-4 text-center">
            Não foi possível encontrar o clima de uma cidade com este nome.
          </p>
        )}

        {/* Sugestões de cidades */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-white pt-4">
          {["Viena", "Copenhague", "Zurique", "Vancouver", "Genebra", "Frankfurt", "Osaka", "Maceió"].map(
            (city) => (
              <button
                key={city}
                className="px-4 py-2 bg-sky-400 rounded-full hover:bg-sky-500 transition font-bold text-white opacity-80 hover:opacity-100"
                onClick={() => handleSuggestionClick(city)}
              >
                {city}
              </button>
            )
          )}
        </div>

        {/* Exibição dos dados climáticos */}
        {weatherData && (
          <div className="border-t border-white mt-6 pt-6 text-center">
            <h2 className="flex justify-center items-center mb-3 text-xl font-semibold">
              <FaMapMarkerAlt className="text-base" />
              <span className="mx-3">{weatherData.name}</span>
              {weatherData.sys?.country && (
                <img
                  src={`https://flagsapi.com/${weatherData.sys.country}/flat/64.png`}
                  alt="Bandeira do país"
                  className="h-9"
                />
              )}
            </h2>
            <p className="text-4xl font-bold">
              {Math.round(weatherData.main?.temp)}&deg;C
            </p>
            <div className="flex justify-center items-center my-3">
              <p className="capitalize font-bold text-lg">{weatherData.weather[0]?.description}</p>
              <img
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0]?.icon}.png`}
                alt="Condições do tempo"
              />
            </div>
            <div className="flex justify-center items-center gap-6">
              <p className="border-r-2 pr-4 flex items-center gap-2">
                <FaDroplet />
                <span>{weatherData.main?.humidity}%</span>
              </p>
              <p className="flex items-center gap-2">
                <FaWind />
                <span>{weatherData.wind?.speed} km/h</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
