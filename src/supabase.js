import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxzzoahtckgzhlpxasko.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4enpvYWh0Y2tnemhscHhhc2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3Njg0MTMsImV4cCI6MjA2MTM0NDQxM30.2t7pYNkFrQ-YuEsLCQf0BMO5Dz0l2ZLu1nxL--HyUfA";
export const supabase = createClient(supabaseUrl, supabaseKey);

/////////////////////////////
//     AUTHENTICATION      //
/////////////////////////////

export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error("Not authenticated");
  return data;
}

export async function getUserFromToken(token) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data) throw new Error("Unauthorized");
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error("Encountered an error while trying to logout");

  return (success = true);
}

export async function usernameTaken(username) {
  const { data: existingUsername, error: usernameError } = await supabase
    .from("Users")
    .select("uuid")
    .eq("username", username)
    .single();

  if (usernameError && usernameError.code !== "PGRST116")
    throw new Error(usernameError.message);

  if (existingUsername) {
    return true;
  } else {
    return false;
  }
}

export async function setUIDandUsername(uuid, username) {
  const { data: existingUsername, error: usernameError } = await supabase
    .from("Users")
    .select("uuid")
    .eq("username", username)
    .single();

  if (usernameError && usernameError.code !== "PGRST116")
    throw new Error(usernameError.message);

  if (existingUsername) throw new Error("Username is already taken");

  const { data: existingUser, error: userError } = await supabase
    .from("Users")
    .select("username")
    .eq("uuid", uuid)
    .single();

  if (userError && userError.code !== "PGRST116")
    throw new Error(userError.message);

  if (existingUser) throw new Error("User already registered");

  const { error: insertError } = await supabase
    .from("Users")
    .insert({ uuid, username });

  if (insertError)
    throw new Error("Could not register user: " + insertError.message);
}

export async function getUIDfromUsername(username) {
  const { data: existingUser, error: userError } = await supabase
    .from("Users")
    .select("uuid")
    .eq("username", username)
    .single();

  if (userError && userError.code !== "PGRST116") {
    throw new Error(userError.message);
  }

  if (!existingUser) {
    throw new Error("UUID not found!");
  }

  return existingUser.uuid;
}

export async function getUsernamefromUID(uuid) {
  const { data: existingUser, error: userError } = await supabase
    .from("Users")
    .select("username")
    .eq("uuid", uuid)
    .single();

  if (userError && userError.code !== "PGRST116") {
    throw new Error(userError.message);
  }

  if (!existingUser) {
    throw new Error("Username not found!");
  }

  return existingUser.username;
}

////////////////////////////////
//          CONTACTS          //
////////////////////////////////

export async function addToContact(userA, userB) {
  await Promise.all([
    updateContacts(userA, userB),
    updateContacts(userB, userA),
  ]);
  return "Success";
}

async function updateContacts(uuid, newContact) {
  const { data, error: selectError } = await supabase
    .from("Contacts")
    .select("contacts")
    .eq("uuid", uuid)
    .single();

  if (selectError && selectError.code !== "PGRST116")
    throw new Error(selectError.message);

  let updatedContacts;
  if (data) {
    const currentContacts = data.contacts || [];
    if (!currentContacts.includes(newContact)) {
      updatedContacts = [...currentContacts, newContact];
      if (currentContacts.length < 50) {
        const { error: updateError } = await supabase
          .from("Contacts")
          .update({ contacts: updatedContacts })
          .eq("uuid", uuid);
        if (updateError) throw new Error(updateError.message);
      } else {
        throw new Error("50 contact limit REACHED!");
      }
    }
  } else {
    updatedContacts = [newContact];
    const { error: insertError } = await supabase
      .from("Contacts")
      .insert({ uuid, contacts: updatedContacts });
    if (insertError) throw new Error(insertError.message);
  }
}

export async function getAllContacts(userID) {
  const { data, error } = await supabase
    .from("Contacts")
    .select("contacts")
    .eq("uuid", userID)
    .single();

  if (error) throw new Error(error.message);
  return data || [];
}

export async function removeFromContact(userA, userB) {
  const { data, error } = await supabase
    .from("Contacts")
    .select("contacts")
    .eq("uuid", userA)
    .single();

  if (error || !data) throw new Error("User not found or fetch failed");

  const updatedContacts = (data.contacts || []).filter(
    (contact) => contact !== userB
  );

  const { error: updateError } = await supabase
    .from("Contacts")
    .update({ contacts: updatedContacts })
    .eq("uuid", userA);

  if (updateError) throw new Error(updateError.message);
}
