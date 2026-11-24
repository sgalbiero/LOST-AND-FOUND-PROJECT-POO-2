package com.portal.achadosperdidos.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

@AnalyzeClasses(
        packages = "com.portal.achadosperdidos",
        importOptions = ImportOption.DoNotIncludeTests.class
)
class LayerArchitectureTest {

    @ArchTest
    static final ArchRule controllers_nao_acessam_persistencia = noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAnyPackage("..repository..", "..entity..");

    @ArchTest
    static final ArchRule dominio_nao_depende_de_camadas_externas = noClasses()
            .that().resideInAPackage("..entity..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..controller..", "..service..", "..repository..", "..dto..", "..config..");

    @ArchTest
    static final ArchRule repositorios_nao_dependem_de_camadas_superiores = noClasses()
            .that().resideInAPackage("..repository..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..controller..", "..service..", "..dto..", "..config..");

    @ArchTest
    static final ArchRule services_nao_dependem_de_web_ou_configuracao = noClasses()
            .that().resideInAPackage("..service..")
            .should().dependOnClassesThat().resideInAnyPackage("..controller..", "..config..");

    @ArchTest
    static final ArchRule pacotes_sem_ciclos = slices()
            .matching("com.portal.achadosperdidos.(*)..")
            .should().beFreeOfCycles();
}
