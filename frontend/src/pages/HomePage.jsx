import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

function HomePage() {
  return (
    <div>
      <button
        className="btn btn-secondary"
        onClick={() => toast.success("This is a success toast")}
      >
        Click me
      </button>

      <SignedOut>
        <SignInButton>
          <button mode="modal">Login</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
    </div>
  );
}

export default HomePage;
