import { Account, ID } from "appwrite";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../appContext";
import { supabase } from "../config";

interface FormValues {
  email: string;
  password: string;
  name: string;
}

export const Register = () => {
  const { setSession } = useContext(AppContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async ({ email, password, name }: FormValues) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (result.error) {
      console.error(result.error);
    } else {
      const { user } = result.data; // Session is null, but can request lol
      if (user) {
        const sessionData = await supabase.auth.getSession();
        if (sessionData.data.session) {
          setSession(sessionData.data.session);
        }

        navigate("/");
      }
    }
  });

  const loginWithProvider = (provider: string) => provider;

  return (
    <div>
      <button>Create test users (Create a lot of test user with password 123456)</button>

      <form onSubmit={onSubmit}>
        <h1>Register</h1>

        <input {...register("email")} placeholder="Email" />

        <input {...register("password")} type="password" placeholder="Password" />

        <input {...register("name")} placeholder="Name" />

        <input type="submit" value="Register" />
      </form>

      <button onClick={() => loginWithProvider("google")}>Register with Gmail</button>

      <button onClick={() => loginWithProvider("discord")}>Register with Discord</button>
      <button onClick={() => loginWithProvider("github")}>Register with Github</button>
    </div>
  );
};
