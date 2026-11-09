import sqlite3,pathlib
c=sqlite3.connect(':memory:')
for migration in sorted(pathlib.Path('drizzle').glob('*.sql')):
 c.executescript(migration.read_text().replace('--> statement-breakpoint',''))
c.execute("INSERT INTO users VALUES ('u','u@example.test','Guru','user',0,0)")
c.execute("INSERT INTO payments VALUES ('p','u',25000,'Guru','REF-123','pending',1,NULL,NULL)")
def approve():
 with c:
  c.execute("UPDATE users SET until=100 WHERE id='u' AND until=0 AND EXISTS(SELECT 1 FROM payments WHERE id='p' AND status='pending')")
  c.execute("UPDATE payments SET status='approved',reviewed=2,reviewer='admin' WHERE id='p' AND status='pending'")
approve();approve()
assert c.execute("SELECT until FROM users WHERE id='u'").fetchone()[0]==100
assert c.execute("SELECT status FROM payments WHERE id='p'").fetchone()[0]=='approved'
c.execute("INSERT OR IGNORE INTO settings VALUES (1,0,'','','','owner')")
c.execute("INSERT OR IGNORE INTO settings VALUES (1,0,'','','','attacker')")
assert c.execute('SELECT admin_id FROM settings').fetchone()[0]=='owner'
print('PASS: migration, approval idempotency, one-time admin claim')
