This is a directory to store TingoDB collection files.
http://www.tingodb.com/

There will be one file per collection.
Records are stored in append mode, which means that if you do an
update you'll see an additional record in the file but don't 
fret, the database does the right thing and counts the later
one as the real record.
