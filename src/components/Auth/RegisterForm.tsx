import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Crown,
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuthStore } from "../../store/authStore";
import { RegisterCredentials } from "../../types/auth";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { register, isLoading, error, clearError } = useAuthStore();

  // Check if reCAPTCHA is properly configured
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isRecaptchaEnabled =
    recaptchaSiteKey &&
    recaptchaSiteKey !== "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setCaptchaError(null);

    if (!acceptTerms) {
      return;
    }

    // Only require captcha if it's enabled and properly configured
    if (isRecaptchaEnabled && !captchaValue) {
      setCaptchaError("Por favor, complete a verificação reCAPTCHA");
      return;
    }

    const success = await register(credentials);
    if (success) {
      // Navigation will be handled by the main App component
    } else {
      // Reset captcha on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaValue(null);
      }
    }
  };

  const handleInputChange = (
    field: keyof RegisterCredentials,
    value: string,
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(credentials.password);
  const strengthColors = [
    "bg-red-500",
    "bg-red-400",
    "bg-yellow-500",
    "bg-yellow-400",
    "bg-green-500",
  ];
  const strengthLabels = ["Muito Fraca", "Fraca", "Regular", "Boa", "Forte"];

  const isVitoca = credentials.username.toLowerCase() === "vitoca";

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-3xl shadow-2xl pt-10 px-8 pb-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Junte-se aos Xenopets
          </h1>
          <p className="text-gray-600">Crie sua conta e comece sua aventura</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Admin Preview */}
        {isVitoca && (
          <motion.div
            className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-semibold">
                  Conta de Administrador
                </p>
                <p className="text-yellow-700 text-sm">
                  Você terá acesso ao painel administrativo!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Digite seu email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome de Usuário *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Escolha um nome de usuário"
                required
                autoComplete="username"
              />
              {isVitoca && (
                <Crown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Phone Field (Optional) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telefone (Opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={credentials.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Digite seu telefone"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Crie uma senha forte"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {credentials.password && (
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Força da senha:{" "}
                  {strengthLabels[passwordStrength - 1] || "Muito Fraca"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={credentials.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirme sua senha"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {credentials.confirmPassword &&
                credentials.password === credentials.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
            </div>
          </div>

          {/* Captcha */}
          {recaptchaSiteKey && (
            <div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  onChange={(value) => {
                    setCaptchaValue(value);
                    setCaptchaError(null);
                  }}
                  onExpired={() => setCaptchaValue(null)}
                  onError={() =>
                    setCaptchaError(
                      "Erro ao carregar reCAPTCHA. Tente recarregar a página.",
                    )
                  }
                  theme="light"
                />
              </div>
              {captchaError && (
                <motion.div
                  className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{captchaError}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Development Notice */}
          {!recaptchaSiteKey && (
            <motion.div
              className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-yellow-800 text-sm text-center">
                <strong>Modo de Desenvolvimento:</strong> reCAPTCHA desabilitado
              </p>
            </motion.div>
          )}

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <span className="text-sm text-gray-600">
                Eu concordo com os{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Política de Privacidade
                </a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={
              isLoading || !acceptTerms || (isRecaptchaEnabled && !captchaValue)
            }
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Criar Conta</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Entre aqui
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
