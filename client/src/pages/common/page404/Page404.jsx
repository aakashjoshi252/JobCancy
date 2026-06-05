import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PageNotFound() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
            <h1 className="text-5xl font-extrabold text-red-600 mb-4">{t("errors.notFoundTitle")}</h1>

            <p className="text-gray-700 text-center max-w-md mb-6">
                {t("errors.notFoundMessage")}
            </p>

            <NavLink to="/">
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                >
                    {t("common.goHome")}
                </button>
            </NavLink>
        </div>
    );
}
