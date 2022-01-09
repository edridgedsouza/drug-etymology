#!/usr/bin/env python3

# Data from INN Stembook 2018
# https://www.who.int/publications/i/item/who-emp-rht-tsn-2018-1
# https://cdn.who.int/media/docs/default-source/international-nonproprietary-names-(inn)/stembook-2018.pdf?sfvrsn=32a51b3c_6&download=true

from pscript import py2js


class Linguist():

    def __init__(self, file):
        self.definitions = {}
        self.patterns = {}
        self._process_file(file)

    def _process_file(self, file):
        with open(file, 'r') as f:
            for line in f:
                l = line.strip()
                stem, defn = l.split('\t')
                self.definitions[stem] = defn

                pattern = self._pattern_func(stem)
                self.patterns[stem] = pattern

    @staticmethod
    def _pattern_func(stem):
        stem = stem.lower()
        root = Linguist._strip_dash(stem)

        if stem.startswith('-') and not stem.endswith('-'):
            def func(drugname): return drugname.lower().endswith(root)
        elif stem.endswith('-') and not stem.startswith('-'):
            def func(drugname): return drugname.lower().startswith(root)
        elif stem.startswith('-') and stem.endswith('-'):
            def func(drugname): return root in drugname.lower()
        else:
            def func(drugname): return stem in drugname.lower()

        return func

    @staticmethod
    def _strip_dash(string):
        return string.replace('-', '')

    def etymology(self, drug):
        drug = drug.lower()
        matching_roots = []

        for stem, search_pattern in self.patterns.items():
            if search_pattern(drug):
                matching_roots.append(stem)

        out = {}  # py2js can't handle a dict comp
        for stem in matching_roots:
            out[stem] = self.definitions[stem]

        return out

    def explain(self, drug):
        res = self.etymology(drug)
        if res:
            lst = '\n'.join(
                [f'\t{stem}:\t{defn}' for stem, defn in res.items()])
            out = (f'Possible etymologies for drug {drug}:\n{lst}\n')
        else:
            out = (f'No matching etymologies for drug {drug}.\n')
        return out


l = Linguist('./stems.tsv')
with open('main.js', 'w') as f:
    f.write(py2js(Linguist))


if __name__ == '__main__':
    while True:
        d = input('What drug would you like to analyze?\n')
        if d.lower() == 'exit':
            print('Thanks for using my tool! Check it out on GitHub '
                  'https://github.com/edridgedsouza/drug-etymology')
            break
        print(l.explain(d))
