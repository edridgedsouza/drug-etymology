#!/usr/bin/env python3

# Data from INN Stembook 2018
# https://www.who.int/publications/i/item/who-emp-rht-tsn-2018-1
# https://cdn.who.int/media/docs/default-source/international-nonproprietary-names-(inn)/stembook-2018.pdf?sfvrsn=32a51b3c_6&download=true

import re

class Linguist():

    def __init__(self, file):
        self.definitions = {}
        self.patterns = {}
        self._process_file(file)

    @staticmethod
    def _strip_dash(string):
        return string.replace('-', '')

    def _process_file(self, file):
        with open(file, 'r') as f:
            for line in f:
                l = line.strip()
                stem, defn = l.split('\t')
                self.definitions[stem] = defn
                
                root = self._strip_dash(stem)
                if stem.startswith('-') and not stem.endswith('-'):
                    pattern = re.compile(f'.*{root}')
                elif stem.endswith('-') and not stem.startswith('-'):
                    pattern = re.compile(f'{root}.*')
                elif stem.startswith('-') and stem.endswith('-'):
                    pattern = re.compile(f'.*{root}.*')
                else:
                    pattern = re.compile(f'.*{stem}.*')
                    
                self.patterns[stem] = pattern
                
    def _etymology(self, drug):
        drug = drug.lower()
        matching_roots = []
        
        for stem, pattern in self.patterns.items():
            if re.search(pattern, drug):
                matching_roots.append(stem)
                
        return {stem:self.definitions[stem] for stem in matching_roots}

    def explain(self, drug):
        res = self._etymology(drug)
        if res:
            lst = '\n'.join([f'{stem}:\t{defn}' for stem, defn in res.items()])
            out = (f'Possible etymologies for drug {drug}:\n{lst}\n')
        else:
            out = (f'No matching etymologies for drug {drug}.\n')
        return out
                

if __name__ == '__main__':
    l = Linguist('./stems.tsv')
    while True:
        d = input('What drug would you like to analyze?\n')
        if d.lower() == 'exit':
            print('Thanks for using my tool! Check it out on GitHub '
                  '@edridgedsouza/drug-etymology')
            break
        print(l.explain(d))