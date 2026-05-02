export const MYTHS = [
  // ── INDIA MYTHS ──
  { 
    code: 'IND_MYTH_01', countryCode: 'IND', category: 'MYTH', 
    fact: 'If NOTA (None of the Above) gets the highest votes, the election is cancelled and a re-election is held.', 
    plainFact: 'FALSE. NOTA is a "protest vote." Even if NOTA wins, the candidate with the next highest votes is declared the winner.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_02', countryCode: 'IND', category: 'MYTH', 
    fact: 'Electronic Voting Machines (EVMs) are connected to the internet and can be hacked remotely.', 
    plainFact: 'FALSE. EVMs are stand-alone machines with no internet, Wi-Fi, or Bluetooth connectivity. They are hardware-coded and tamper-evident.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_03', countryCode: 'IND', category: 'MYTH', 
    fact: 'You cannot vote if you do not have a physical Electors Photo Identity Card (EPIC).', 
    plainFact: 'FALSE. If your name is on the electoral roll, you can vote using 12 other approved IDs like Aadhaar, PAN card, or Passport.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_04', countryCode: 'IND', category: 'MYTH', 
    fact: 'Voters can cast their vote online via a mobile app or official website.', 
    plainFact: 'FALSE. India does not have online or internet voting. You must physically visit your designated polling booth to vote.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_05', countryCode: 'IND', category: 'MYTH', 
    fact: 'Non-Resident Indians (NRIs) can vote by post from the country where they reside.', 
    plainFact: 'FALSE. NRIs must be physically present at their home constituency in India on election day to cast their vote.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_06', countryCode: 'IND', category: 'MYTH', 
    fact: 'Mobile phones are allowed inside the polling booth to take a photo of the ballot/EVM.', 
    plainFact: 'FALSE. Carrying mobile phones, cameras, or any recording device inside the polling station is strictly prohibited by law.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_07', countryCode: 'IND', category: 'MYTH', 
    fact: 'If you have a Voter ID card, you are automatically eligible to vote even if your name is not on the roll.', 
    plainFact: 'FALSE. Having a Voter ID card is not enough. Your name MUST be present in the current Electoral Roll to be eligible to vote.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },
  { 
    code: 'IND_MYTH_08', countryCode: 'IND', category: 'MYTH', 
    fact: 'Public holidays for elections are only for government employees.', 
    plainFact: 'FALSE. Election day is a mandatory paid holiday for all employees (public and private) to ensure they can exercise their right to vote.', 
    volatilityClass: 'STABLE', sourceCode: 'ECI' 
  },

  // ── USA MYTHS ──
  { 
    code: 'USA_MYTH_01', countryCode: 'USA', category: 'MYTH', 
    fact: 'Massive numbers of dead people vote in every federal election, changing the outcome.', 
    plainFact: 'FALSE. While roll maintenance can be slow, actual "dead voting" is extremely rare and usually involves isolated mistakes, not systemic fraud.', 
    volatilityClass: 'STABLE', sourceCode: 'VOTE_GOV' 
  },
  { 
    code: 'USA_MYTH_02', countryCode: 'USA', category: 'MYTH', 
    fact: 'Non-citizens and undocumented immigrants can legally vote in federal elections.', 
    plainFact: 'FALSE. Federal law strictly prohibits non-citizens from voting in federal elections. Violators face deportation and criminal charges.', 
    volatilityClass: 'STABLE', sourceCode: 'VOTE_GOV' 
  },
  { 
    code: 'USA_MYTH_03', countryCode: 'USA', category: 'MYTH', 
    fact: 'You can vote via text message or by posting a hashtag on social media.', 
    plainFact: 'FALSE. There is no "voting by text." You must vote in person, by mail (if eligible), or via an official drop box.', 
    volatilityClass: 'STABLE', sourceCode: 'EAC' 
  },
  { 
    code: 'USA_MYTH_04', countryCode: 'USA', category: 'MYTH', 
    fact: 'Once you have a criminal record, you lose your right to vote for life in the US.', 
    plainFact: 'FALSE. Rules vary by state, but many states restore voting rights automatically after completion of sentence, parole, or probation.', 
    volatilityClass: 'MEDIUM', sourceCode: 'VOTE_GOV' 
  },
  { 
    code: 'USA_MYTH_05', countryCode: 'USA', category: 'MYTH', 
    fact: 'Mail-in ballots are counted only if the race is close.', 
    plainFact: 'FALSE. All validly cast ballots, including mail-in and absentee ballots, are counted in every election, regardless of the margin.', 
    volatilityClass: 'STABLE', sourceCode: 'EAC' 
  },
  { 
    code: 'USA_MYTH_06', countryCode: 'USA', category: 'MYTH', 
    fact: 'If you leave some races blank on your ballot, your entire ballot is disqualified.', 
    plainFact: 'FALSE. You can choose to vote in as many or as few races as you like. "Under-voting" does not invalidate your other choices.', 
    volatilityClass: 'STABLE', sourceCode: 'VOTE_GOV' 
  },
  { 
    code: 'USA_MYTH_07', countryCode: 'USA', category: 'MYTH', 
    fact: 'Voter registration is automatic when you get a driver\'s licence in all states.', 
    plainFact: 'FALSE. While many states have "Motor Voter" laws, it is not universal or always automatic. You must confirm your registration status.', 
    volatilityClass: 'MEDIUM', sourceCode: 'VOTE_GOV' 
  },
  { 
    code: 'USA_MYTH_08', countryCode: 'USA', category: 'MYTH', 
    fact: 'Voting machines are connected to the internet, allowing foreign hackers to change tallies.', 
    plainFact: 'FALSE. Voting machines are not connected to the internet during the voting process. They use air-gapped systems and physical security.', 
    volatilityClass: 'STABLE', sourceCode: 'EAC' 
  },

  // ── UK MYTHS ──
  { 
    code: 'GBR_MYTH_01', countryCode: 'GBR', category: 'MYTH', 
    fact: 'You must have your polling card with you to be allowed to vote at the station.', 
    plainFact: 'FALSE. You do not need your polling card to vote. You just need to give your name and address (and show ID in England).', 
    volatilityClass: 'STABLE', sourceCode: 'ECUK' 
  },
  { 
    code: 'GBR_MYTH_02', countryCode: 'GBR', category: 'MYTH', 
    fact: 'You can vote online in UK General Elections.', 
    plainFact: 'FALSE. The UK does not support online voting. You must vote in person, by post, or by proxy.', 
    volatilityClass: 'STABLE', sourceCode: 'GOV_UK_VOTE' 
  },
  { 
    code: 'GBR_MYTH_03', countryCode: 'GBR', category: 'MYTH', 
    fact: 'EU citizens can vote in UK General (Parliamentary) Elections.', 
    plainFact: 'FALSE. EU citizens (who are not also British, Irish, or qualifying Commonwealth citizens) cannot vote in UK General Elections.', 
    volatilityClass: 'STABLE', sourceCode: 'ECUK' 
  },
  { 
    code: 'GBR_MYTH_04', countryCode: 'GBR', category: 'MYTH', 
    fact: 'Prisoners in the UK have a general right to vote in all elections.', 
    plainFact: 'FALSE. Most prisoners serving a sentence are barred from voting. Only those on remand or in unconvicted status can vote.', 
    volatilityClass: 'STABLE', sourceCode: 'GOV_UK_VOTE' 
  },
  { 
    code: 'GBR_MYTH_05', countryCode: 'GBR', category: 'MYTH', 
    fact: 'You can use a photo or digital copy of your ID on your phone to vote in England.', 
    plainFact: 'FALSE. You must show the original, physical version of an accepted photo ID. Digital copies are not accepted.', 
    volatilityClass: 'STABLE', sourceCode: 'ECUK' 
  },
  { 
    code: 'GBR_MYTH_06', countryCode: 'GBR', category: 'MYTH', 
    fact: 'If you have two homes, you can vote twice in a UK General Election.', 
    plainFact: 'FALSE. While you can be registered at two addresses, voting more than once in the same General Election is a criminal offence.', 
    volatilityClass: 'STABLE', sourceCode: 'ECUK' 
  },
  { 
    code: 'GBR_MYTH_07', countryCode: 'GBR', category: 'MYTH', 
    fact: 'Writing a protest message on your ballot paper ensures your voice is heard by MPs.', 
    plainFact: 'FALSE. Writing anything other than a cross (X) risks "spoiling" your ballot, making it invalid and uncounted.', 
    volatilityClass: 'STABLE', sourceCode: 'ECUK' 
  },
  { 
    code: 'GBR_MYTH_08', countryCode: 'GBR', category: 'MYTH', 
    fact: 'You can vote at any polling station in your city.', 
    plainFact: 'FALSE. You must vote at the specific polling station assigned to your address on the electoral roll.', 
    volatilityClass: 'STABLE', sourceCode: 'GOV_UK_VOTE' 
  },

  // ── CANADA MYTHS ──
  { 
    code: 'CAN_MYTH_01', countryCode: 'CAN', category: 'MYTH', 
    fact: 'Canadians can vote online or via a secure mobile app.', 
    plainFact: 'FALSE. Federal elections in Canada are paper-based. You must vote in person or by mail via special ballot.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_02', countryCode: 'CAN', category: 'MYTH', 
    fact: 'You cannot vote if you do not have a fixed permanent address (e.g. experiencing homelessness).', 
    plainFact: 'FALSE. You can vote by using the address of a shelter, hostel, or any place providing food or lodging as your place of residence.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_03', countryCode: 'CAN', category: 'MYTH', 
    fact: 'You need to speak English or French to be eligible to vote.', 
    plainFact: 'FALSE. There is no language requirement for voting. Polling stations provide assistance and translated materials.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_04', countryCode: 'CAN', category: 'MYTH', 
    fact: 'If you have a criminal record, you are permanently barred from voting in Canada.', 
    plainFact: 'FALSE. Almost all Canadian citizens aged 18+ can vote, regardless of their past or current criminal record.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_05', countryCode: 'CAN', category: 'MYTH', 
    fact: 'You cannot register to vote on the same day you go to the polling station.', 
    plainFact: 'FALSE. Canada allows "Election Day Registration." You can register at the polls as long as you have the required ID.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_06', countryCode: 'CAN', category: 'MYTH', 
    fact: 'Non-citizens who have lived in Canada for 10+ years can vote in federal elections.', 
    plainFact: 'FALSE. Only Canadian citizens are eligible to vote in federal elections, regardless of how long a non-citizen has lived in the country.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_07', countryCode: 'CAN', category: 'MYTH', 
    fact: 'You can vote over the phone if you are unable to reach a polling station.', 
    plainFact: 'FALSE. Canada does not offer phone voting. Use mail-in (special ballot) if you cannot attend a station.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },
  { 
    code: 'CAN_MYTH_08', countryCode: 'CAN', category: 'MYTH', 
    fact: 'Only people with a Voter Information Card (VIC) are allowed to vote.', 
    plainFact: 'FALSE. The VIC is for information only. You can vote without it if you are registered and have accepted ID.', 
    volatilityClass: 'STABLE', sourceCode: 'EC_CA' 
  },

  // ── AUSTRALIA MYTHS ──
  { 
    code: 'AUS_MYTH_01', countryCode: 'AUS', category: 'MYTH', 
    fact: 'You only need to put the number "1" next to your favourite candidate for your vote to count.', 
    plainFact: 'FALSE. In the House of Representatives, you must number EVERY box on the green ballot for your vote to be valid.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_02', countryCode: 'AUS', category: 'MYTH', 
    fact: 'Compulsory voting is a violation of human rights and can be ignored without penalty.', 
    plainFact: 'FALSE. Compulsory voting is legal in Australia. Failing to vote without a valid reason leads to a fine and potential court action.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_03', countryCode: 'AUS', category: 'MYTH', 
    fact: 'Voting for a minor party or independent candidate "wastes" your vote.', 
    plainFact: 'FALSE. Because of preferential voting, if your first-choice candidate is excluded, your vote is transferred to your next choice.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_04', countryCode: 'AUS', category: 'MYTH', 
    fact: 'You must show a photo ID (like a driver\'s licence) at the polling station.', 
    plainFact: 'FALSE. Most states in Australia do not require ID to vote. You only need to provide your name and address.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_05', countryCode: 'AUS', category: 'MYTH', 
    fact: 'Australians living or travelling overseas are exempt from compulsory voting.', 
    plainFact: 'FALSE. Overseas Australians are still encouraged to vote and must notify the AEC if they cannot do so to avoid a fine.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_06', countryCode: 'AUS', category: 'MYTH', 
    fact: 'You can vote online in Australian Federal Elections.', 
    plainFact: 'FALSE. There is no online voting for federal elections. You must vote in person or by post.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_07', countryCode: 'AUS', category: 'MYTH', 
    fact: 'If you make a mistake on your ballot paper, you cannot get a new one.', 
    plainFact: 'FALSE. If you make a mistake, do not put it in the box. Take it to a polling official and ask for a "spoilt" replacement ballot.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  },
  { 
    code: 'AUS_MYTH_08', countryCode: 'AUS', category: 'MYTH', 
    fact: 'You can vote as many times as you like if you visit different polling booths.', 
    plainFact: 'FALSE. Multiple voting is a serious crime. The AEC marks you off the roll each time, and duplicates are detected during the count.', 
    volatilityClass: 'STABLE', sourceCode: 'AEC' 
  }
];
