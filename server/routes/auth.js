const express = require('express');
const bcrypt = require('bcryptjs');
const { signUser, requireAuth } = require('../middleware/auth');
const { getUserByEmail, getUserById, createUser, updateUser, getSettings, addActivity } = require('../services/recordService');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const row = await getUserByEmail(email, true);
    if (!row || row.status === 'Blocked' || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ message:'Email or password is incorrect.' });
    }
    const user = await getUserById(row.id);
    const token = signUser(user);
    await addActivity('User signed in', `${user.email} signed in.`, user.name);
    res.json({ token, user });
  } catch (error) { next(error); }
});

router.post('/register', async (req, res, next) => {
  try {
    const settings = await getSettings();
    if (settings.registrationsEnabled === false) return res.status(403).json({ message:'New registrations are currently disabled.' });
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
      return res.status(400).json({ message:'Name, valid email, and a password of at least 6 characters are required.' });
    }
    if (await getUserByEmail(email)) return res.status(409).json({ message:'An account already exists with this email.' });
    const allowedRoles = ['Founder','Investor'];
    const user = await createUser({
      name, email, password,
      role: allowedRoles.includes(req.body.role) ? req.body.role : 'General User',
      country: String(req.body.country || ''), status:'Active', verified:false,
      joinedAt:new Date().toISOString().slice(0,10),
    });
    const token = signUser(user);
    await addActivity('User registered', `${user.email} created an account.`, user.name);
    res.status(201).json({ token, user });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.status === 'Blocked') return res.status(401).json({ message:'This account is unavailable.' });
    res.json({ user });
  } catch (error) { next(error); }
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const allowed = { name:req.body.name, email:req.body.email, country:req.body.country };
    Object.keys(allowed).forEach((k) => allowed[k] == null && delete allowed[k]);
    const user = await updateUser(req.user.id, allowed);
    await addActivity('Profile updated', `${user.email} updated their account profile.`, user.name);
    res.json({ user, token:signUser(user) });
  } catch (error) { next(error); }
});

module.exports = router;
