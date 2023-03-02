import { Account, ID } from "appwrite";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../appContext";
import { supabase } from "../config";

interface FormValues {
  email: string;
  password: string;
}

export const Login = () => {
  const { setSession } = useContext(AppContext);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async ({ email, password }: FormValues) => {
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      console.log(result.error);
    } else {
      const { user, session } = result.data;
      console.log({ user, session });

      if (session) {
        setSession(session);
        navigate("/");
      }
    }
  });

  const loginWithProvider = (provider: string) => provider;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <h1>Login</h1>

        <input {...register("email")} placeholder="Email" />

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
        />

        <input type="submit" value="Login" />
      </form>

      <button onClick={() => loginWithProvider("google")}>
        Login with Gmail
      </button>

      <button onClick={() => loginWithProvider("discord")}>
        Login with Discord
      </button>
      <button onClick={() => loginWithProvider("github")}>
        Login with Github
      </button>
    </div>
  );
};
