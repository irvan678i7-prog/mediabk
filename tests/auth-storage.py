import sqlite3,pathlib
c=sqlite3.connect(':memory:')
for migration in sorted(pathlib.Path('drizzle').glob('*.sql')):
 c.executescript(migration.read_text().replace('--> statement-breakpoint',''))
c.execute("INSERT INTO users VALUES ('u','u@gmail.com','Guru','user',0,0)")
c.execute("INSERT INTO auth_challenges VALUES ('hash','nonce',100)")
assert c.execute("DELETE FROM auth_challenges WHERE token_hash=? AND expires_at>? RETURNING nonce",('hash',99)).fetchone()==('nonce',)
assert c.execute("DELETE FROM auth_challenges WHERE token_hash=? AND expires_at>? RETURNING nonce",('hash',99)).fetchone() is None
c.execute("INSERT INTO auth_sessions VALUES ('session','u',100)")
def access(token,now):
 return c.execute('SELECT u.id FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.blocked=0',(token,now)).fetchone()
assert access('session',99)==('u',)
assert access('session',100) is None
assert access('wrong',99) is None
c.execute("UPDATE users SET blocked=1")
assert access('session',99) is None
c.execute("UPDATE users SET blocked=0")
c.execute("DELETE FROM auth_sessions WHERE token_hash='session'")
assert access('session',99) is None
print('PASS: migrations, one-time challenge, session expiry, block, logout')
