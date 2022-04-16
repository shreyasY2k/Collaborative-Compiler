# For Perl (language) only

# syntax (NOTE: this overwrites your original string)
<variable> =~ s/<substring-to-replace>/<replacing-substring>/g;

# example: replacing all the 'r' characters with 'l'
$YourVar =~ s/r/l/g;

# usable example
my $YourVar = "strawberry";
$YourVar =~ s/r/l/g;
print $YourVar; 
print "\n";