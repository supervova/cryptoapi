$twig = new \Twig\Environment($loader, [
'cache' => false,
]);

            if(is_dir($_SERVER['DOCUMENT_ROOT'].DIRECTORY_SEPARATOR.'projects'.DIRECTORY_SEPARATOR.$_SERVER['HTTP_HOST'].DIRECTORY_SEPARATOR.'translate')){
                $translator = new Symfony\Component\Translation\Translator($user_lng.'_'.mb_strtoupper($user_lng));
                $translator->addLoader('po', new \Symfony\Component\Translation\Loader\PoFileLoader());
                $finder = new \Symfony\Component\Finder\Finder();
                $poFiles = $finder->files()->in($_SERVER['DOCUMENT_ROOT'].DIRECTORY_SEPARATOR.'projects'.DIRECTORY_SEPARATOR.$_SERVER['HTTP_HOST'].DIRECTORY_SEPARATOR.'translate'.DIRECTORY_SEPARATOR.'*')->name('GeneralUI.po')->name(str_replace('.twig', "", $tname).'.po');
                foreach ($poFiles->getIterator() as $oneFile) {
                    $pp = explode(DIRECTORY_SEPARATOR,$oneFile->getPath());
                    $locale = array_pop( $pp );
                    $fp = explode('.',$oneFile->getFilename());
                    $domain = count($fp)===3 ? $fp[1] : 'messages';
                    $translator->addResource( 'po',
                        $oneFile->getPath().DIRECTORY_SEPARATOR.$oneFile->getFilename(),
                        $locale,
                        $domain);
                }
                $filter1 = new \Twig\TwigFilter('trans', function ($string) use($deflng,$translator) {

                    $newString = $translator->trans($string);
                    if($newString === $string || $newString === ''){
                        $newString = getphrase($string, $deflng);
                    }

                    $newString = str_replace('','
            ',$newString);
                    return html_entity_decode($newString);
                });
            }else{
                $filter1 = new \Twig\TwigFilter('trans', function ($string) use($deflng) {
                    $f = getphrase($string, $deflng);
                    $f = str_replace('','
            ',$f);
                    return html_entity_decode($f);
                });
            }
