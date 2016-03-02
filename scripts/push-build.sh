#!/bin/sh

# Formatting variables
blackBG='\033[1;40m'
cyan='\033[1;36m'$blackBG
gray='\033[1;30m'$blackBG
green='\033[1;32m'$blackBG
red='\033[0;31m'$blackBG
yellow='\033[1;33m'$blackBG
nc='\033[0m'$blackBG

# Convenience strings
divider="\n\t=======================================\n"
bigDivider="${green}==========================================================================================================${nc}"
remoteOptionsString="${divider}\n\tAvailable Remotes:\n\t-----------------\n"
buildOptionsString="${divider}\n\tAvailable Builds:\n\t-----------------\n"

# Get some info from git
branch=$(git rev-parse --abbrev-ref HEAD)
remotes=$(git remote)

# Some regular expressions
reYes='^[yY](es)?$'
reNo='^[nN](o)?$'
reYesNo='^([yY](es)?)|([nN](o)?)$'
reOpts='^('
bOpts='^(0|1)$'

# Defaults for prompted values
stopGrunt=""
buildOpt=""
commit=""
isFinal=""
confirm=""
message=""
remoteOpt=""
release="skip"
releaseOpt=""
copyToMT=""

remoteOptions=[]
let i=0

# Abort is currently in the build branch
if [[ $branch =~ "build" ]]; then
	echo "\n\t${red}Error: You're already on a ${cyan}build${red} branch.\n\n\tPlease switch to the branch from which you want to create your build!\n"
	exit 1;
fi

# Clear the screen and display information about the script
echo $blackBG
clear
echo $bigDivider
echo "\tThis script is meant to help you create a new build for this project."
echo "\tIt assumes your current branch (${cyan}${branch}${nc}) is the one from which you want to create a build."
echo "\tIf this is not what you're looking for, quit now with CTRL+C."
echo $bigDivider

# Check if grunt is running and ask to stop it
gruntProcess=$(ps cax | grep grunt | sed -e "s/ s.*//g" | sed -e "s/ //g")
if [[ $(ps cax | grep grunt | sed -e "s/ s.*//g" | sed -e "s/ //g") ]]; then
	echo "\n\t${yellow}Looks like you've got grunt running.${nc}\n"
	while [[ ! $stopGrunt =~ $reYesNo ]]; do
		printf "\tCan I stop it? [Y/n] "
		read stopGrunt
		if [[ $stopGrunt =~ $reNo ]]; then
			echo "\n\t${red}I was only asking to be nice. I ain't doing this shit if you've got grunt running.\n"
			exit 1;
		else
			stopGrunt="y"
			kill $gruntProcess
			echo "\n\tGreat! ${yellow}Stopping grunt...${nc}"
		fi
	done
fi

# Get the release version if there is one
while [[ $release == "" ]]; do
	printf "${nc}\n\tWhat release number is this?. ${gray}(ex. v0.0.29)${cyan} "
	read release
done

if [[ $release = "skip" ]]; then
	echo "${nc}\n\tGot it. ${cyan}Not a release.${nc} Let's get building!"
else
	releaseOpt=" --release=$release"
	echo "${nc}\n\tGot it. We'll be adding ${cyan}$release${nc} to the compiled build files. Let's get building!"
fi


while [[ ! $commit =~ $reYesNo ]]; do
	printf "${nc}\n\tDid you want to commit the build files to git? [y/n] ${cyan}"
	read commit
	if [[ ! $commit =~ $reNo ]]; then
		commit="y"
		echo "${nc}\n\tNo problem. We just need some more information.\n"

		# Get list of available remotes
		for r in $remotes; do
			remoteOptionsString=$remoteOptionsString"\t[${green}$i${nc}] $r\n"
			remoteOptions[$i]=$r
			reOpts=$reOpts'|'$i
			let i=$i+1
		done
		reOpts=$(echo $reOpts')$' | sed -e s/\|//)''

		# Display menu of remotes for selection
		while [[ ! $remoteOpt =~ $reOpts ]]; do
			printf "${nc}${remoteOptionsString}\n\tWhich remote should we commit to?${cyan} "
			read remoteOpt
			printf $nc
			if [[ ! $remoteOpt =~ $reOpts ]]; then
				echo "\n\t${yellow}Sorry. You did not pick a valid remote.${nc}"
			else
				remote=${remoteOptions[$remoteOpt]}
				echo "${nc}\n\tOK. We'll push to ${cyan}$remote${nc}.\n"
			fi
		done


		# Get a commit message
		while [[ ${#message} -lt 10 ]]; do
			printf "${nc}\tPlease enter your commit message. ${gray}(10 character min)${cyan}\n\t"
			read message
			if [[ ${#message} -lt 10 ]]; then
				echo "\t${yellow}Come on! Stop being such a lazy fuck!${nc}\n"
			fi
		done
		if [[ ${#releaseOpt} -gt 1 ]]; then
			message=$message" ### RELEASE $release"
		fi
	fi
	printf $nc
done

# Final confirmation
clear
echo "\n${nc}${divider}"
echo "\n\tWe'll be creating a new build from your ${cyan}$branch${nc} branch."
# echo "\n\tCompiled files will be saved to ${cyan}release/build/$release/${nc}."
if [[ ! $commit =~ $reNo ]]; then
	# echo "\n\tCompiled files will also be saved to ${cyan}build/${nc}."
	echo "\tIf you have a local ${cyan}build${nc} branch, it will ${red}remove${nc} it."
	echo "\tIt will then create a new ${cyan}build${nc} branch, \n\tand push the new branch to ${cyan}$remote${nc} with the following commit message:\n\t ${cyan}$message${nc}\n"
fi

while [[ ! $confirm =~ $reYesNo ]]; do
	printf "${nc}\n\tThis sound good to you? [y/n] ${cyan}"
	read confirm
	if [[ $confirm =~ $reNo ]]; then
		echo "${red}\n\tYou're just wasting my time then, huh? Well fine. Fuck you, then.\n\n${nc}"
		exit;
	fi
	printf $nc
done
echo "\n\tOk. Here we go.\n"
echo "\n${bigDivider}\n\n"

if [[ ! $commit =~ $reNo ]]; then
	# Check if build branch already exists, and delete it if it does
	if [[ $(git show-ref refs/heads/build) ]]; then
	  git branch -D build
	fi
	 
	# Create a new build branch and check it out
	git checkout -b build
	
	# Run the setup script which pulls everything necessary in
	sh scripts/setup.sh

	# Add the build folder to the repo
	git add -f assets
	git add -f app/*
	git add -f bower_components

	git rm -rf tasks --force
	git rm -rf scripts --force
	# git rm -rf .gitignore
	git rm -rf .npmignore
	git rm -rf .bowerrc
	git rm -rf bower.json
	git rm -rf package.json
	git rm -rf Gruntfile.js
		
	
	# Create the commit using the message that we specified
	git commit -q -m "$message"
	
	# Push the build branch
	git push -q $remote build --force
	echo "\n\tBuild pushed."
	
else
	sh scripts/setup.sh
fi

# Fuck with people
echo "\n${green}Done!\n\n\n"
sleep 3;
echo "${yellow}... Maybe.\n\n"
